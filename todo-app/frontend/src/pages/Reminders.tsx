import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import styles from './PagePlaceholder.module.css'

export default function Reminders() {
  return (
    <div className={styles.shell}>
      <Sidebar activeItem="Reminders" onItemSelect={() => {}} />
      <main className={styles.main}>
        <Header pageTitle="Reminders" />
        <div className={styles.content}>
          <h2>Reminders</h2>
          <p>Placeholder page for reminders.</p>
        </div>
      </main>
    </div>
  )
}
