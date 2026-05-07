import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import styles from './PagePlaceholder.module.css'

export default function Categories() {
  return (
    <div className={styles.shell}>
      <Sidebar activeItem="Categories" onItemSelect={() => {}} />
      <main className={styles.main}>
        <Header pageTitle="Categories" />
        <div className={styles.content}>
          <h2>Categories</h2>
          <p>Placeholder page for categories.</p>
        </div>
      </main>
    </div>
  )
}
