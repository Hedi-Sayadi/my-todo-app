import { useEffect, useState } from 'react';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import type { Task } from '../types/task';
import TaskModal from '../components/TaskModal';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import KanbanColumn from '../components/KanbanColumn';
import {
  createTask,
  deleteTask,
  listTasks,
  updateTask as updateTaskRequest,
  type TaskPayload,
} from '../services/taskService';
import { listCategories } from '../services/categoryService';
import type { Category } from '../types/category';
import styles from './TasksPage.module.css';

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const refreshTasks = async () => {
    const taskData = await listTasks();
    setTasks(taskData);
  };

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setIsLoading(true);
        setError('');
        const [taskData, categoryData] = await Promise.all([listTasks(), listCategories()]);

        if (isMounted) {
          setTasks(taskData);
          setCategories(categoryData);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load tasks');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const filteredTasks = tasks.filter((task) => {
    const searchableText = [task.title, task.description, task.category.name, task.priority]
      .join(' ')
      .toLowerCase();
    return searchableText.includes(query.toLowerCase());
  });

  const todoTasks = filteredTasks.filter((t) => t.status === 'TODO');
  const inProgressTasks = filteredTasks.filter((t) => t.status === 'IN_PROGRESS');
  const doneTasks = filteredTasks.filter((t) => t.status === 'DONE');

  const handleOpenModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleSaveTask = (taskData: TaskPayload) => {
    const saveTask = async () => {
      try {
        setError('');
        if (editingTask) {
          const updatedTask = await updateTaskRequest(editingTask.id, taskData);
          setTasks((prev) => prev.map((task) => (task.id === updatedTask.id ? updatedTask : task)));

          const shouldRefresh =
            editingTask.status !== 'DONE' &&
            taskData.status === 'DONE' &&
            taskData.recurrencePattern !== 'NONE';

          if (shouldRefresh) {
            await refreshTasks();
          }
        } else {
          const createdTask = await createTask(taskData);
          setTasks((prev) => [createdTask, ...prev]);
        }
        handleCloseModal();
      } catch (saveError) {
        setError(saveError instanceof Error ? saveError.message : 'Failed to save task');
      }
    };

    void saveTask();
  };

  const handleDeleteTask = (id: number) => {
    const removeTask = async () => {
      try {
        setError('');
        await deleteTask(id);
        setTasks((prev) => prev.filter((task) => task.id !== id));
      } catch (deleteError) {
        setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete task');
      }
    };

    void removeTask();
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const [activeStatus, activeId] = active.id.toString().split('-');
    const [overStatus] = over.id.toString().split('-');

    if (activeStatus !== overStatus) {
      const taskId = Number(activeId);
      const currentTask = tasks.find((task) => task.id === taskId);

      if (!currentTask) return;

      const previousTasks = tasks;
      const nextStatus = overStatus as Task['status'];
      const shouldRefresh =
        currentTask.status !== 'DONE' &&
        nextStatus === 'DONE' &&
        currentTask.recurrencePattern !== 'NONE';

      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? { ...task, status: nextStatus } : task))
      );

      void updateTaskRequest(taskId, {
        title: currentTask.title,
        description: currentTask.description,
        priority: currentTask.priority,
        recurrencePattern: currentTask.recurrencePattern,
        deadline: currentTask.deadline,
        categoryId: currentTask.category.id,
        status: nextStatus,
      })
        .then(async () => {
          if (shouldRefresh) {
            await refreshTasks();
          }
        })
        .catch((dragError) => {
          setTasks(previousTasks);
          setError(dragError instanceof Error ? dragError.message : 'Failed to update task');
        });
    }
  };

  return (
    <div className={styles.shell}>
      <Sidebar onItemSelect={() => {}} />
      <main className={styles.main}>
        <Header pageTitle="Tasks" searchValue={query} onSearchChange={setQuery} />

        <div className={styles.container}>
          <div className={styles.topBar}>
            <div>
              <p className={styles.eyebrow}>Task Management</p>
              <h2 className={styles.title}>Kanban Board</h2>
            </div>
            <button className={styles.createButton} onClick={handleOpenModal} type="button">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Task
            </button>
          </div>

          {error && (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>{error}</p>
              <button
                className={styles.emptyButton}
                onClick={() => window.location.reload()}
                type="button"
              >
                Retry
              </button>
            </div>
          )}

          {isLoading ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>Loading tasks from the backend...</p>
            </div>
          ) : (
            <>
              <div className={styles.stats}>
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>Total</span>
                  <strong className={styles.statValue}>{tasks.length}</strong>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>Todo</span>
                  <strong className={styles.statValue}>{todoTasks.length}</strong>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>In progress</span>
                  <strong className={styles.statValue}>{inProgressTasks.length}</strong>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>Done</span>
                  <strong className={styles.statValue}>{doneTasks.length}</strong>
                </div>
              </div>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragEnd={handleDragEnd}
              >
                {filteredTasks.length > 0 ? (
                  <div className={styles.kanbanBoard}>
                    <KanbanColumn
                      status="TODO"
                      title="Todo"
                      tasks={todoTasks}
                      onEditTask={handleEditTask}
                      onDeleteTask={handleDeleteTask}
                    />
                    <KanbanColumn
                      status="IN_PROGRESS"
                      title="In Progress"
                      tasks={inProgressTasks}
                      onEditTask={handleEditTask}
                      onDeleteTask={handleDeleteTask}
                    />
                    <KanbanColumn
                      status="DONE"
                      title="Done"
                      tasks={doneTasks}
                      onEditTask={handleEditTask}
                      onDeleteTask={handleDeleteTask}
                    />
                  </div>
                ) : (
                  <div className={styles.emptyState}>
                    <p className={styles.emptyText}>No tasks match your search.</p>
                  </div>
                )}
              </DndContext>
            </>
          )}
        </div>
      </main>

      <TaskModal
        isOpen={isModalOpen}
        task={editingTask}
        categories={categories}
        onClose={handleCloseModal}
        onSave={handleSaveTask}
      />
    </div>
  );
}
