import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../types/task';
import styles from './KanbanTaskCard.module.css';

interface KanbanTaskCardProps {
  task: Task;
  status: Task['status'];
  onEdit: () => void;
  onDelete: () => void;
}

const statusLabels: Record<Task['status'], string> = {
  TODO: 'Todo',
  IN_PROGRESS: 'In progress',
  DONE: 'Done',
};

const statusColors: Record<Task['status'], string> = {
  TODO: '#f3f4f6',
  IN_PROGRESS: 'rgba(245, 158, 11, 0.18)',
  DONE: 'rgba(22, 163, 74, 0.12)',
};

const statusTextColors: Record<Task['status'], string> = {
  TODO: '#4b5563',
  IN_PROGRESS: '#b45309',
  DONE: '#15803d',
};

const priorityColors: Record<Task['priority'], { bg: string; text: string }> = {
  LOW: { bg: 'rgba(22, 163, 74, 0.12)', text: '#15803d' },
  MEDIUM: { bg: 'rgba(245, 158, 11, 0.18)', text: '#b45309' },
  HIGH: { bg: 'rgba(239, 68, 68, 0.18)', text: '#991b1b' },
};

export default function KanbanTaskCard({ task, status, onEdit, onDelete }: KanbanTaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `${status}-${task.id}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={styles.card}>
      <div className={styles.cardHeader} {...attributes} {...listeners}>
        <div className={styles.titleSection}>
          <h4 className={styles.title}>{task.title}</h4>
          <span className={styles.categoryBadge}>{task.category.name}</span>
        </div>
        <div
          className={styles.actions}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button
            className={styles.iconButton}
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            title="Edit task"
          >
            ✎
          </button>
          <button
            className={styles.iconButton}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="Delete task"
          >
            ✕
          </button>
        </div>
      </div>

      {task.description && (
        <p className={styles.description} {...attributes} {...listeners}>
          {task.description}
        </p>
      )}

      <div className={styles.metadata}>
        <span
          className={styles.statusBadge}
          style={{
            background: statusColors[status],
            color: statusTextColors[status],
          }}
        >
          {statusLabels[status]}
        </span>
        <span
          className={styles.priorityBadge}
          style={{
            background: priorityColors[task.priority].bg,
            color: priorityColors[task.priority].text,
          }}
        >
          {task.priority}
        </span>
      </div>

      {task.deadline && <div className={styles.deadline}></div>}
    </div>
  );
}
