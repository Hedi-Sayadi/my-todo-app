import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import styles from './PagePlaceholder.module.css'

export default function Settings() {
  return (
    <div className={styles.shell}>
      <Sidebar activeItem="Settings" onItemSelect={() => {}} />
      <main className={styles.main}>
        <Header pageTitle="Settings" />
        <div className={styles.content}>
          <h2>Settings</h2>
          <p>Placeholder page for settings and preferences.</p>
        </div>
      </main>
    </div>
  )
}
