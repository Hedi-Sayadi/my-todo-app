import { useState, useEffect } from 'react'
import type { Task } from '../types/task'
import styles from './TaskModal.module.css'

interface TaskModalProps {
  isOpen: boolean
  task?: Task | null
  onClose: () => void
  onSave: (task: Omit<Task, 'id'>) => void
}

const priorities = ['LOW', 'MEDIUM', 'HIGH']
const statuses = ['TODO', 'IN_PROGRESS', 'DONE']
const statusLabels: Record<'TODO' | 'IN_PROGRESS' | 'DONE', string> = {
  TODO: 'Todo',
  IN_PROGRESS: 'In progress',
  DONE: 'Done',
}

export default function TaskModal({ isOpen, task, onClose, onSave }: TaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM')
  const [deadline, setDeadline] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState<'TODO' | 'IN_PROGRESS' | 'DONE'>('TODO')

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description)
      setPriority(task.priority)
      setDeadline(task.deadline ?? '')
      setCategory(task.category)
      setStatus(task.status)
    } else {
      setTitle('')
      setDescription('')
      setPriority('MEDIUM')
      setDeadline('')
      setCategory('')
      setStatus('TODO')
    }
  }, [task, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    onSave({
      title,
      description,
      priority,
      deadline,
      category,
      status,
    })

    setTitle('')
    setDescription('')
    setPriority('MEDIUM')
    setDeadline('')
    setCategory('')
    setStatus('TODO')
  }

  if (!isOpen) return null

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>{task ? 'Edit Task' : 'Create New Task'}</h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            type="button"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="title" className={styles.label}>
              Task Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description" className={styles.label}>
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description"
              className={styles.textarea}
              rows={3}
            />
          </div>

          <div className={styles.grid2}>
            <div className={styles.formGroup}>
              <label htmlFor="priority" className={styles.label}>
                Priority
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH')}
                className={styles.select}
              >
                {priorities.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="status" className={styles.label}>
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'TODO' | 'IN_PROGRESS' | 'DONE')}
                className={styles.select}
              >
                {statuses.map((item) => (
                  <option key={item} value={item}>
                    {statusLabels[item as 'TODO' | 'IN_PROGRESS' | 'DONE']}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="category" className={styles.label}>
              Category *
            </label>
            <input
              id="category"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Planning"
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="deadline" className={styles.label}>
              Deadline
            </label>
            <input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.footer}>
            <button type="button" onClick={onClose} className={styles.buttonSecondary}>
              Cancel
            </button>
            <button type="submit" className={styles.buttonPrimary}>
              {task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
