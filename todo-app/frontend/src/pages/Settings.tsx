import { useEffect, useState } from 'react'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import { getActiveSession } from '../services/authService'
import styles from './PagePlaceholder.module.css'

const SETTINGS_STORAGE_KEY = 'todo-app-settings'

type SettingsState = {
  displayName: string
  taskReminders: boolean
  weeklySummary: boolean
  soundAlerts: boolean
}

const defaultSettings: SettingsState = {
  displayName: '',
  taskReminders: true,
  weeklySummary: false,
  soundAlerts: true,
}

function loadStoredSettings(): SettingsState {
  if (typeof window === 'undefined') return defaultSettings

  try {
    const rawValue = window.localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (!rawValue) return defaultSettings

    return { ...defaultSettings, ...(JSON.parse(rawValue) as Partial<SettingsState>) }
  } catch {
    return defaultSettings
  }
}

export default function Settings() {
  const session = getActiveSession()
  const currentUser = session?.user
  const accountName = currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Signed-in user'

  const [settings, setSettings] = useState<SettingsState>(() => {
    const storedSettings = loadStoredSettings()
    return {
      ...storedSettings,
      displayName: storedSettings.displayName || accountName,
    }
  })
  const [statusMessage, setStatusMessage] = useState('')
  const [savedAt, setSavedAt] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
  }, [settings])

  const updateSetting = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    setSettings((current) => ({ ...current, [key]: value }))
    setStatusMessage('')
  }

  const handleSave = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
    }

    setSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    setStatusMessage('Settings saved locally in your browser.')
  }

  const handleReset = () => {
    setSettings({
      ...defaultSettings,
      displayName: accountName,
    })
    setSavedAt('')
    setStatusMessage('Settings restored to defaults.')
  }

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
                Keep the signed-in account up to date and control the core app notifications.
              </p>
            </div>
            <div className={styles.buttonGroup}>
              <button className={styles.createButton} type="button" onClick={handleSave}>Save Changes</button>
              <button className={styles.secondaryButton} type="button" onClick={handleReset}>Reset</button>
            </div>
          </div>

          {statusMessage && (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>{statusMessage}</p>
              {savedAt ? <p className={styles.emptyText}>Last saved at {savedAt}</p> : null}
            </div>
          )}

          <section className={styles.settingsGrid}>
            <div className={styles.profileCard}>
              <p className={styles.sectionLabel}>Profile</p>
              <h3 className={styles.sectionTitle}>Your account info</h3>
              <div className={styles.formGrid}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="displayName">Display name</label>
                  <input
                    id="displayName"
                    className={styles.fieldInput}
                    value={settings.displayName}
                    onChange={(e) => updateSetting('displayName', e.target.value)}
                  />
                </div>
                <div className={styles.settingRow}>
                  <div>
                    <div className={styles.itemName}>Email address</div>
                    <div className={styles.itemMeta}>{currentUser?.email ?? 'No active session'}</div>
                  </div>
                  <span className={styles.chip}>Read only</span>
                </div>
              </div>
            </div>
            <div className={styles.settingCard}>
              <p className={styles.sectionLabel}>Notifications</p>
              <h3 className={styles.sectionTitle}>App behavior</h3>
              <div className={styles.settingRow}>
                <div>
                  <div className={styles.itemName}>Task reminders</div>
                  <div className={styles.itemMeta}>Alert when deadlines are approaching</div>
                </div>
                <button
                  type="button"
                  aria-pressed={settings.taskReminders}
                  className={settings.taskReminders ? styles.toggle : `${styles.toggle} ${styles.toggleOff}`}
                  onClick={() => updateSetting('taskReminders', !settings.taskReminders)}
                />
              </div>
              <div className={styles.settingRow}>
                <div>
                  <div className={styles.itemName}>Weekly summary</div>
                  <div className={styles.itemMeta}>Send a status digest every Monday</div>
                </div>
                <button
                  type="button"
                  aria-pressed={settings.weeklySummary}
                  className={settings.weeklySummary ? styles.toggle : `${styles.toggle} ${styles.toggleOff}`}
                  onClick={() => updateSetting('weeklySummary', !settings.weeklySummary)}
                />
              </div>
              <div className={styles.settingRow}>
                <div>
                  <div className={styles.itemName}>Sound alerts</div>
                  <div className={styles.itemMeta}>Use a short chime for urgent reminders</div>
                </div>
                <button
                  type="button"
                  aria-pressed={settings.soundAlerts}
                  className={settings.soundAlerts ? styles.toggle : `${styles.toggle} ${styles.toggleOff}`}
                  onClick={() => updateSetting('soundAlerts', !settings.soundAlerts)}
                />
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
