import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import styles from './PagePlaceholder.module.css'

const categories = [
  {
    name: 'Planning',
    color: 'var(--accent)',
    tasks: 4,
    active: 2,
    description: 'Roadmaps, research, and milestone work.',
  },
  {
    name: 'UX',
    color: '#f59e0b',
    tasks: 3,
    active: 1,
    description: 'Flows, wireframes, and interface polish.',
  },
  {
    name: 'Architecture',
    color: '#10b981',
    tasks: 2,
    active: 1,
    description: 'State, routing, and project structure.',
  },
  {
    name: 'Setup',
    color: '#ef4444',
    tasks: 1,
    active: 0,
    description: 'Project bootstrap and shared tooling.',
  },
]

export default function Categories() {
  return (
    <div className={styles.shell}>
      <Sidebar activeItem="Categories" onItemSelect={() => {}} />
      <main className={styles.main}>
        <Header pageTitle="Categories" />
        <div className={styles.content}>
          <div className={styles.topBar}>
            <div>
              <p className={styles.eyebrow}>Organization</p>
              <h2 className={styles.title}>Categories</h2>
              <p className={styles.subtitle}>
                Organize tasks by theme, see what is active, and keep the backlog grouped in a way that matches how you work.
              </p>
            </div>
            <button className={styles.createButton} type="button">+ New Category</button>
          </div>

          <div className={styles.stats}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Total categories</span>
              <strong className={styles.statValue}>{categories.length}</strong>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Active tasks</span>
              <strong className={styles.statValue}>{categories.reduce((total, category) => total + category.active, 0)}</strong>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Most used</span>
              <strong className={styles.statValue}>Planning</strong>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Unassigned</span>
              <strong className={styles.statValue}>2</strong>
            </div>
          </div>

          <section className={styles.panel}>
            <p className={styles.sectionLabel}>Category Overview</p>
            <h3 className={styles.sectionTitle}>What each category covers</h3>
            <p className={styles.sectionText}>
              Categories work best when they are short, specific, and easy to scan. Use them for intent, not for every tiny status.
            </p>

            <div className={styles.panelGrid} style={{ marginTop: '16px' }}>
              {categories.map((category) => (
                <article className={styles.categoryCard} key={category.name}>
                  <div className={styles.metricRow}>
                    <div className={styles.tagRow}>
                      <span className={styles.categoryDot} style={{ backgroundColor: category.color }} />
                      <h4 className={styles.cardTitle} style={{ margin: 0 }}>{category.name}</h4>
                    </div>
                    <span className={styles.chip}>{category.tasks} tasks</span>
                  </div>
                  <p className={styles.cardText}>{category.description}</p>
                  <div className={styles.actionRow}>
                    <span className={styles.activeBadge}>{category.active} active</span>
                    <button className={styles.secondaryButton} type="button">Edit</button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.panel}>
            <p className={styles.sectionLabel}>Quick Actions</p>
            <div className={styles.listGrid} style={{ marginTop: '16px' }}>
              <div className={styles.infoCard}>
                <h4 className={styles.cardTitle}>Create a category</h4>
                <p className={styles.cardText}>Use a short label and color to keep the sidebar and task cards easy to scan.</p>
              </div>
              <div className={styles.infoCard}>
                <h4 className={styles.cardTitle}>Merge similar tags</h4>
                <p className={styles.cardText}>Combine overlapping categories so you do not split tasks across too many buckets.</p>
              </div>
              <div className={styles.infoCard}>
                <h4 className={styles.cardTitle}>Filter by category</h4>
                <p className={styles.cardText}>Use category filters to focus on planning, UX, architecture, or setup work.</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
