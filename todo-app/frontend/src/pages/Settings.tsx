import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import styles from './PagePlaceholder.module.css'

const profileSettings = [
  { label: 'Display name', value: 'Jane Doe' },
  { label: 'Email', value: 'jane.doe@example.com' },
  { label: 'Workspace', value: 'TodoFlow Team' },
]

export default function Settings() {
  return (
    <div className={styles.shell}>
      <Sidebar activeItem="Settings" onItemSelect={() => {}} />
      <main className={styles.main}>
        <Header pageTitle="Settings" />
        <div className={styles.content}>
          <div className={styles.topBar}>
            <div>
              <p className={styles.eyebrow}>Preferences</p>
              <h2 className={styles.title}>Settings</h2>
              <p className={styles.subtitle}>
                Adjust the app experience, manage profile details, and prepare the frontend for the next backend-connected version.
              </p>
            </div>
            <button className={styles.createButton} type="button">Save Changes</button>
          </div>

          <section className={styles.settingsGrid}>
            <div className={styles.profileCard}>
              <p className={styles.sectionLabel}>Profile</p>
              <h3 className={styles.sectionTitle}>Your account info</h3>
              <div className={styles.list}>
                {profileSettings.map((setting) => (
                  <div className={styles.settingRow} key={setting.label}>
                    <div>
                      <div className={styles.itemName}>{setting.label}</div>
                      <div className={styles.itemMeta}>{setting.value}</div>
                    </div>
                    <button className={styles.secondaryButton} type="button">Edit</button>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.settingCard}>
              <p className={styles.sectionLabel}>Appearance</p>
              <h3 className={styles.sectionTitle}>Visual experience</h3>
              <div className={styles.settingRow}>
                <div>
                  <div className={styles.itemName}>Theme</div>
                  <div className={styles.itemMeta}>System with light/dark support</div>
                </div>
                <span className={styles.chip}>Auto</span>
              </div>
              <div className={styles.settingRow}>
                <div>
                  <div className={styles.itemName}>Density</div>
                  <div className={styles.itemMeta}>Comfortable spacing for task cards</div>
                </div>
                <div className={styles.slider} style={{ maxWidth: '120px' }} />
              </div>
              <div className={styles.settingRow}>
                <div>
                  <div className={styles.itemName}>Accent color</div>
                  <div className={styles.itemMeta}>Primary brand color used across the UI</div>
                </div>
                <span className={styles.chip}>#2563eb</span>
              </div>
            </div>
          </section>

          <section className={styles.settingsGrid}>
            <div className={styles.settingCard}>
              <p className={styles.sectionLabel}>Notifications</p>
              <h3 className={styles.sectionTitle}>App behavior</h3>
              <div className={styles.settingRow}>
                <div>
                  <div className={styles.itemName}>Task reminders</div>
                  <div className={styles.itemMeta}>Alert when deadlines are approaching</div>
                </div>
                <div className={styles.toggle} />
              </div>
              <div className={styles.settingRow}>
                <div>
                  <div className={styles.itemName}>Weekly summary</div>
                  <div className={styles.itemMeta}>Send a status digest every Monday</div>
                </div>
                <div className={`${styles.toggle} ${styles.toggleOff}`} />
              </div>
              <div className={styles.settingRow}>
                <div>
                  <div className={styles.itemName}>Sound alerts</div>
                  <div className={styles.itemMeta}>Use a short chime for urgent reminders</div>
                </div>
                <div className={styles.toggle} />
              </div>
            </div>

            <div className={styles.settingCard}>
              <p className={styles.sectionLabel}>Data</p>
              <h3 className={styles.sectionTitle}>Local workspace</h3>
              <p className={styles.cardText}>
                These controls are the natural place for persistence, sync, and account-related features once the backend connection is ready.
              </p>
              <div className={styles.buttonGroup}>
                <button className={styles.secondaryButton} type="button">Export tasks</button>
                <button className={styles.secondaryButton} type="button">Reset demo data</button>
              </div>
              <div className={styles.emptyState}>
                <p className={styles.emptyText}>Backend sync and authentication can plug in here later without changing the page structure.</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
