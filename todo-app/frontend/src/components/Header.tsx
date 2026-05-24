import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearStoredSession, getActiveSession } from '../services/authService';
import { listReminders } from '../services/reminderService';
import type { Reminder } from '../types/reminder';
import styles from './Header.module.css';

interface HeaderProps {
  pageTitle?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

export default function Header({
  pageTitle = 'Dashboard',
  searchValue = '',
  onSearchChange,
}: HeaderProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false);
  const [localSearchValue, setLocalSearchValue] = useState('');
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [notificationError, setNotificationError] = useState('');
  const navigate = useNavigate();
  const session = getActiveSession();
  const effectiveSearchValue = onSearchChange ? searchValue : localSearchValue;

  useEffect(() => {
    let isMounted = true;

    const loadNotifications = async () => {
      try {
        setIsLoadingNotifications(true);
        setNotificationError('');
        const data = await listReminders();

        if (isMounted) {
          setReminders(data);
        }
      } catch (loadError) {
        if (isMounted) {
          setNotificationError(
            loadError instanceof Error ? loadError.message : 'Failed to load notifications'
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingNotifications(false);
        }
      }
    };

    void loadNotifications();

    return () => {
      isMounted = false;
    };
  }, []);

  const activeNotifications = useMemo(
    () =>
      reminders
        .filter((reminder) => reminder.status !== 'DONE')
        .sort((left, right) => {
          const leftTime = new Date(left.snoozeUntil ?? left.reminderAt).getTime();
          const rightTime = new Date(right.snoozeUntil ?? right.reminderAt).getTime();
          return leftTime - rightTime;
        }),
    [reminders]
  );

  const notificationCount = activeNotifications.length;

  const formatNotificationDate = (value: string) =>
    new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(value));

  const profileInitials = (() => {
    const firstNameInitial = session?.user.firstName?.trim().charAt(0) ?? '';
    const lastNameInitial = session?.user.lastName?.trim().charAt(0) ?? '';
    const initials = `${firstNameInitial}${lastNameInitial}`.toUpperCase();

    return initials || 'U';
  })();

  const handleLogout = () => {
    clearStoredSession();
    navigate('/login');
  };

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <h2 className={styles.pageTitle}>{pageTitle}</h2>
      </div>

      <div className={styles.center}>
        <div className={`${styles.searchBox} ${isSearchFocused ? styles.searchBoxFocused : ''}`}>
          <svg
            className={styles.searchIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search tasks..."
            className={styles.searchInput}
            value={effectiveSearchValue}
            onChange={(e) => {
              if (onSearchChange) {
                onSearchChange(e.target.value);
                return;
              }

              setLocalSearchValue(e.target.value);
            }}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.notificationMenuContainer}>
          <button
            className={styles.iconButton}
            aria-label="Notifications"
            aria-expanded={isNotificationMenuOpen}
            aria-haspopup="menu"
            type="button"
            onClick={() => {
              setIsNotificationMenuOpen((current) => !current);
              setIsProfileMenuOpen(false);
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {notificationCount > 0 && <span className={styles.badge}>{notificationCount}</span>}
          </button>

          {isNotificationMenuOpen && (
            <div className={styles.notificationMenu}>
              <div className={styles.notificationMenuHeader}>Notifications</div>

              {isLoadingNotifications ? (
                <p className={styles.notificationMenuMessage}>Loading notifications...</p>
              ) : notificationError ? (
                <p className={styles.notificationMenuMessage}>Unable to load notifications.</p>
              ) : notificationCount === 0 ? (
                <p className={styles.notificationMenuMessage}>No active notifications.</p>
              ) : (
                activeNotifications.slice(0, 5).map((notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    className={styles.notificationMenuItem}
                    onClick={() => {
                      navigate('/reminders');
                      setIsNotificationMenuOpen(false);
                    }}
                  >
                    <span className={styles.notificationTitle}>{notification.task.title}</span>
                    <span className={styles.notificationMeta}>
                      {formatNotificationDate(notification.snoozeUntil ?? notification.reminderAt)}
                    </span>
                  </button>
                ))
              )}

              <button
                type="button"
                className={styles.notificationMenuAction}
                onClick={() => {
                  navigate('/reminders');
                  setIsNotificationMenuOpen(false);
                }}
              >
                Open reminders
              </button>
            </div>
          )}
        </div>

        <div className={styles.profileMenuContainer}>
          <button
            className={styles.avatarButton}
            aria-label="User profile"
            type="button"
            onClick={() => {
              setIsProfileMenuOpen((current) => !current);
              setIsNotificationMenuOpen(false);
            }}
          >
            <div className={styles.avatar}>
              <span>{profileInitials}</span>
            </div>
          </button>

          {isProfileMenuOpen && (
            <div className={styles.profileMenu}>
              <button
                type="button"
                className={styles.profileMenuItem}
                onClick={() => {
                  navigate('/settings');
                  setIsProfileMenuOpen(false);
                }}
              >
                Settings
              </button>
              <button type="button" className={styles.profileMenuItem} onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
