import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearStoredSession } from '../services/authService'
import styles from './Header.module.css'

interface HeaderProps {
  pageTitle?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
}

export default function Header({ pageTitle = 'Dashboard', searchValue = '', onSearchChange }: HeaderProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    clearStoredSession()
    navigate('/login')
  }

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <h2 className={styles.pageTitle}>{pageTitle}</h2>
      </div>

      <div className={styles.center}>
        <div className={`${styles.searchBox} ${isSearchFocused ? styles.searchBoxFocused : ''}`}>
          <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search tasks..."
            className={styles.searchInput}
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
        </div>
      </div>

      <div className={styles.right}>
        <button className={styles.iconButton} aria-label="Notifications" type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className={styles.badge}>3</span>
        </button>

        <div className={styles.profileMenuContainer}>
          <button
            className={styles.avatarButton}
            aria-label="User profile"
            type="button"
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
          >
            <div className={styles.avatar}>
              <span>JD</span>
            </div>
          </button>

          {isProfileMenuOpen && (
            <div className={styles.profileMenu}>
              <button
                type="button"
                className={styles.profileMenuItem}
                onClick={() => {
                  navigate('/settings')
                  setIsProfileMenuOpen(false)
                }}
              >
                Settings
              </button>
              <button
                type="button"
                className={styles.profileMenuItem}
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}