import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

type SidebarProps = {
  activeItem?: string;
  items?: string[];
  onItemSelect: (item: string) => void;
  brandTitle?: string;
  brandSubtitle?: string;
};

const defaultItems = ['Dashboard', 'Tasks', 'Categories', 'Reminders', 'Settings'];

const itemIcons: Record<string, string> = {
  Dashboard: '◩',
  Tasks: '☰',
  Categories: '◌',
  Reminders: '◷',
  Settings: '⚙',
};

function Sidebar({
  items = defaultItems,
  onItemSelect,
  brandTitle = 'TodoFlow',
  brandSubtitle = 'Smart Productivity',
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={styles.mobileToggle}
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-controls="app-sidebar"
      >
        {isOpen ? 'Close menu' : 'Open menu'}
      </button>

      <aside id="app-sidebar" className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.brandBlock}>
          <div className={styles.brandMark}>T</div>
          <div>
            <p className={styles.brandEyebrow}>{brandSubtitle}</p>
            <h1 className={styles.brandTitle}>{brandTitle}</h1>
          </div>
        </div>

        <nav aria-label="Primary" className={styles.navigation}>
          {items.map((item) => {
            const path = item === 'Dashboard' ? '/' : `/${item.toLowerCase()}`;

            return (
              <NavLink
                key={item}
                to={path}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
                }
                onClick={() => {
                  onItemSelect(item);
                  setIsOpen(false);
                }}
              >
                <span className={styles.navIcon} aria-hidden="true">
                  {itemIcons[item] ?? '•'}
                </span>
                <span>{item}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <p className={styles.sidebarLabel}>Today</p>
          <strong>12 tasks</strong>
          <span>4 due this week</span>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
