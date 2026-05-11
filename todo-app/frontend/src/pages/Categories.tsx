import { useEffect, useMemo, useState } from 'react'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import type { Category } from '../types/category'
import type { Task } from '../types/task'
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
  type CategoryPayload,
} from '../services/categoryService'
import { listTasks } from '../services/taskService'
import styles from './PagePlaceholder.module.css'

const palette = ['var(--accent)', '#f59e0b', '#10b981', '#ef4444', '#14b8a6', '#6366f1']

type CategoryMetric = Category & {
  color: string
  tasks: number
  active: number
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [formName, setFormName] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      try {
        setIsLoading(true)
        setError('')
        const [categoryData, taskData] = await Promise.all([listCategories(), listTasks()])

        if (isMounted) {
          setCategories(categoryData)
          setTasks(taskData)
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load categories')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadData()

    return () => {
      isMounted = false
    }
  }, [])

  const categoryMetrics = useMemo<CategoryMetric[]>(
    () =>
      categories.map((category, index) => {
        const categoryTasks = tasks.filter((task) => task.category.id === category.id)

        return {
          ...category,
          color: palette[index % palette.length],
          tasks: categoryTasks.length,
          active: categoryTasks.filter((task) => task.status !== 'DONE').length,
        }
      }),
    [categories, tasks]
  )

  const totalActiveTasks = categoryMetrics.reduce((total, category) => total + category.active, 0)
  const mostUsedCategory = categoryMetrics.reduce<CategoryMetric | null>((best, category) => {
    if (!best) return category
    return category.tasks > best.tasks ? category : best
  }, null)
  const unassignedTasks = Math.max(
    tasks.length - categoryMetrics.reduce((total, category) => total + category.tasks, 0),
    0
  )

  const resetForm = () => {
    setFormName('')
    setFormDescription('')
    setEditingCategory(null)
    setIsFormOpen(false)
  }

  const startCreate = () => {
    setFormName('')
    setFormDescription('')
    setEditingCategory(null)
    setIsFormOpen(true)
  }

  const startEdit = (category: Category) => {
    setEditingCategory(category)
    setFormName(category.name)
    setFormDescription(category.description ?? '')
    setIsFormOpen(true)
  }

  const handleSubmit = () => {
    const saveCategory = async () => {
      try {
        setError('')

        const payload: CategoryPayload = {
          name: formName,
          description: formDescription,
        }

        if (editingCategory) {
          const updated = await updateCategory(editingCategory.id, payload)
          setCategories((prev) => prev.map((category) => (category.id === updated.id ? updated : category)))
        } else {
          const created = await createCategory(payload)
          setCategories((prev) => [created, ...prev])
        }

        resetForm()
      } catch (saveError) {
        setError(saveError instanceof Error ? saveError.message : 'Failed to save category')
      }
    }

    void saveCategory()
  }

  const handleDelete = (category: Category) => {
    const deleteCurrent = async () => {
      try {
        setError('')
        await deleteCategory(category.id)
        setCategories((prev) => prev.filter((item) => item.id !== category.id))

        if (editingCategory?.id === category.id) {
          resetForm()
        }
      } catch (deleteError) {
        setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete category')
      }
    }

    if (window.confirm(`Delete category "${category.name}"?`)) {
      void deleteCurrent()
    }
  }

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
            <button className={styles.createButton} type="button" onClick={startCreate}>
              + New Category
            </button>
          </div>

          {error ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>{error}</p>
            </div>
          ) : null}

          {isFormOpen ? (
            <section className={styles.panel}>
              <p className={styles.sectionLabel}>{editingCategory ? 'Edit category' : 'Create category'}</p>
              <div className={styles.formGrid}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="category-name">
                    Name
                  </label>
                  <input
                    id="category-name"
                    className={styles.fieldInput}
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Planning"
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="category-description">
                    Description
                  </label>
                  <textarea
                    id="category-description"
                    className={styles.fieldTextarea}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Short note about what belongs here"
                    rows={3}
                  />
                </div>
              </div>
              <div className={styles.buttonGroup} style={{ marginTop: '16px' }}>
                <button
                  className={styles.createButton}
                  type="button"
                  onClick={handleSubmit}
                  disabled={!formName.trim()}
                >
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
                <button className={styles.secondaryButton} type="button" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </section>
          ) : null}

          <div className={styles.stats}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Total categories</span>
              <strong className={styles.statValue}>{categories.length}</strong>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Active tasks</span>
              <strong className={styles.statValue}>{totalActiveTasks}</strong>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Most used</span>
              <strong className={styles.statValue}>{mostUsedCategory?.name ?? 'None'}</strong>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Unassigned</span>
              <strong className={styles.statValue}>{unassignedTasks}</strong>
            </div>
          </div>

          <section className={styles.panel}>
            <p className={styles.sectionLabel}>Category Overview</p>
            <h3 className={styles.sectionTitle}>What each category covers</h3>
            <p className={styles.sectionText}>
              Categories work best when they are short, specific, and easy to scan. Use them for intent, not for every tiny status.
            </p>

            <div className={styles.panelGrid} style={{ marginTop: '16px' }}>
              {isLoading ? (
                <div className={styles.emptyState}>
                  <p className={styles.emptyText}>Loading categories from the backend...</p>
                </div>
              ) : categoryMetrics.length > 0 ? (
                categoryMetrics.map((category) => (
                  <article className={styles.categoryCard} key={category.id}>
                    <div className={styles.metricRow}>
                      <div className={styles.tagRow}>
                        <span className={styles.categoryDot} style={{ backgroundColor: category.color }} />
                        <h4 className={styles.cardTitle} style={{ margin: 0 }}>
                          {category.name}
                        </h4>
                      </div>
                      <span className={styles.chip}>{category.tasks} tasks</span>
                    </div>
                    <p className={styles.cardText}>{category.description ?? 'No description yet.'}</p>
                    <div className={styles.actionRow}>
                      <span className={styles.activeBadge}>{category.active} active</span>
                      <button className={styles.secondaryButton} type="button" onClick={() => startEdit(category)}>
                        Edit
                      </button>
                      <button className={styles.secondaryButton} type="button" onClick={() => handleDelete(category)}>
                        Delete
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <div className={styles.emptyState}>
                  <p className={styles.emptyText}>No categories yet. Create one to organize your tasks.</p>
                </div>
              )}
            </div>
          </section>

          <section className={styles.panel}>
            <p className={styles.sectionLabel}>Quick Actions</p>
            <div className={styles.listGrid} style={{ marginTop: '16px' }}>
              <div className={styles.infoCard}>
                <h4 className={styles.cardTitle}>Create a category</h4>
                <p className={styles.cardText}>Use a short label and description so the sidebar and task cards stay easy to scan.</p>
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
