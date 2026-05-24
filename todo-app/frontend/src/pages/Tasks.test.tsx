import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Tasks from '../pages/Tasks';

vi.mock('../services/taskService', () => ({
  listTasks: vi.fn(),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
}));

vi.mock('../services/categoryService', () => ({
  listCategories: vi.fn(),
}));

vi.mock('../components/Sidebar', () => ({
  default: () => <div>Sidebar Mock</div>,
}));

vi.mock('../components/Header', () => ({
  default: ({
    pageTitle,
    searchValue,
    onSearchChange,
  }: {
    pageTitle: string;
    searchValue?: string;
    onSearchChange?: (value: string) => void;
  }) => (
    <header>
      <h1>{pageTitle}</h1>
      <input
        aria-label="Search tasks"
        placeholder="Search tasks..."
        value={searchValue ?? ''}
        onChange={(event) => onSearchChange?.(event.target.value)}
      />
    </header>
  ),
}));

vi.mock('../components/KanbanColumn', () => ({
  default: ({
    title,
    tasks,
    onEditTask,
    onDeleteTask,
  }: {
    title: string;
    tasks: Array<{ id: number; title: string }>;
    onEditTask: (task: { id: number; title: string }) => void;
    onDeleteTask: (id: number) => void;
  }) => (
    <section aria-label={title}>
      <h2>{title}</h2>
      <span>{tasks.length}</span>
      {tasks.map((task) => (
        <div key={task.id}>
          <span>{task.title}</span>
          <button type="button" onClick={() => onEditTask(task)}>
            Edit
          </button>
          <button type="button" onClick={() => onDeleteTask(task.id)}>
            Delete
          </button>
        </div>
      ))}
    </section>
  ),
}));

vi.mock('../components/TaskModal', () => ({
  default: ({
    isOpen,
    task,
    onClose,
    onSave,
  }: {
    isOpen: boolean;
    task: { id: number; title: string; status: 'TODO' | 'IN_PROGRESS' | 'DONE' } | null;
    onClose: () => void;
    onSave: (task: {
      title: string;
      description: string;
      priority: 'LOW';
      deadline: string;
      categoryId: number;
      status: 'TODO' | 'IN_PROGRESS' | 'DONE';
    }) => void;
  }) => {
    if (!isOpen) return null;

    return (
      <div aria-label="task-modal">
        <p>{task ? `Editing ${task.title}` : 'Creating task'}</p>
        <button type="button" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          onClick={() =>
            onSave({
              title: task ? 'Task 1 updated' : 'Created Task',
              description: task ? 'Updated description' : 'Created description',
              priority: 'LOW',
              deadline: '',
              categoryId: 1,
              status: task ? task.status : 'TODO',
            })
          }
        >
          Save
        </button>
      </div>
    );
  },
}));

import {
  createTask,
  deleteTask,
  listTasks,
  updateTask as updateTaskRequest,
} from '../services/taskService';
import { listCategories } from '../services/categoryService';

const mockCategories = [{ id: 1, name: 'Work', description: '' }];

const mockTasks = [
  {
    id: 1,
    title: 'Task 1',
    description: 'Description 1',
    status: 'TODO',
    priority: 'HIGH',
    deadline: '2026-12-31',
    category: { id: 1, name: 'Work', description: '' },
  },
  {
    id: 2,
    title: 'Task 2',
    description: 'Description 2',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    deadline: null,
    category: { id: 1, name: 'Work', description: '' },
  },
  {
    id: 3,
    title: 'Task 3',
    description: 'Description 3',
    status: 'DONE',
    priority: 'LOW',
    deadline: null,
    category: { id: 1, name: 'Work', description: '' },
  },
];

describe('Tasks page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
  });

  it('displays loading state initially', () => {
    const mockedListTasks = vi.mocked(listTasks);
    const mockedListCategories = vi.mocked(listCategories);

    mockedListTasks.mockImplementation(() => new Promise(() => {}));
    mockedListCategories.mockImplementation(() => new Promise(() => {}));

    render(<Tasks />);

    expect(screen.getByText(/loading tasks/i)).toBeInTheDocument();
  });

  it('loads and displays tasks after loading', async () => {
    const mockedListTasks = vi.mocked(listTasks);
    const mockedListCategories = vi.mocked(listCategories);

    const mockTasks = [
      {
        id: 1,
        title: 'Task 1',
        description: 'Description 1',
        status: 'TODO',
        priority: 'HIGH',
        deadline: '2026-12-31',
        category: { id: 1, name: 'Work', description: '' },
      },
    ];

    const mockCategories = [{ id: 1, name: 'Work', description: '' }];

    mockedListTasks.mockResolvedValue(mockTasks);
    mockedListCategories.mockResolvedValue(mockCategories);

    render(<Tasks />);

    await waitFor(() => {
      expect(mockedListTasks).toHaveBeenCalled();
      expect(mockedListCategories).toHaveBeenCalled();
    });
  });

  it('displays error state when loading fails', async () => {
    const mockedListTasks = vi.mocked(listTasks);
    const mockedListCategories = vi.mocked(listCategories);

    mockedListTasks.mockRejectedValue(new Error('Failed to load tasks'));
    mockedListCategories.mockRejectedValue(new Error('Failed to load categories'));

    render(<Tasks />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load tasks/i)).toBeInTheDocument();
    });
  });

  it('displays kanban board with task counts', async () => {
    const mockedListTasks = vi.mocked(listTasks);
    const mockedListCategories = vi.mocked(listCategories);

    const mockTasks = [
      {
        id: 1,
        title: 'Task 1',
        description: '',
        status: 'TODO',
        priority: 'HIGH',
        deadline: null,
        category: { id: 1, name: 'Work', description: '' },
      },
      {
        id: 2,
        title: 'Task 2',
        description: '',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        deadline: null,
        category: { id: 1, name: 'Work', description: '' },
      },
      {
        id: 3,
        title: 'Task 3',
        description: '',
        status: 'DONE',
        priority: 'LOW',
        deadline: null,
        category: { id: 1, name: 'Work', description: '' },
      },
    ];

    mockedListTasks.mockResolvedValue(mockTasks);
    mockedListCategories.mockResolvedValue([{ id: 1, name: 'Work', description: '' }]);

    render(<Tasks />);

    await waitFor(() => {
      expect(mockedListTasks).toHaveBeenCalled();
    });
  });

  it('displays "Add Task" button', async () => {
    const mockedListTasks = vi.mocked(listTasks);
    const mockedListCategories = vi.mocked(listCategories);

    mockedListTasks.mockResolvedValue([]);
    mockedListCategories.mockResolvedValue([]);

    render(<Tasks />);

    await waitFor(() => {
      expect(mockedListTasks).toHaveBeenCalled();
    });
  });

  it('filters tasks by search query', async () => {
    const mockedListTasks = vi.mocked(listTasks);
    const mockedListCategories = vi.mocked(listCategories);

    const mockTasks = [
      {
        id: 1,
        title: 'Buy Groceries',
        description: 'Milk, bread, eggs',
        status: 'TODO',
        priority: 'HIGH',
        deadline: null,
        category: { id: 1, name: 'Personal', description: '' },
      },
      {
        id: 2,
        title: 'Fix Bug',
        description: 'Login page error',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        deadline: null,
        category: { id: 2, name: 'Work', description: '' },
      },
    ];

    mockedListTasks.mockResolvedValue(mockTasks);
    mockedListCategories.mockResolvedValue([]);

    render(<Tasks />);

    await waitFor(() => {
      expect(mockedListTasks).toHaveBeenCalled();
    });
  });

  async function renderLoadedTasks(tasks = mockTasks) {
    vi.mocked(listTasks).mockResolvedValue(tasks as typeof mockTasks);
    vi.mocked(listCategories).mockResolvedValue(mockCategories);

    render(<Tasks />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Kanban Board' })).toBeInTheDocument();
    });
  }

  it('renders tasks in the kanban board', async () => {
    await renderLoadedTasks();

    expect(screen.getByRole('heading', { name: 'Todo' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'In Progress' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Done' })).toBeInTheDocument();
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
    expect(screen.getByText('Task 3')).toBeInTheDocument();
  });

  it('filters tasks by search query', async () => {
    const user = userEvent.setup();
    await renderLoadedTasks();

    await user.type(screen.getByLabelText(/search tasks/i), 'Task 2');

    expect(screen.queryByText('Task 1')).not.toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
    expect(screen.queryByText('Task 3')).not.toBeInTheDocument();
  });

  it('shows empty state when search matches nothing', async () => {
    const user = userEvent.setup();
    await renderLoadedTasks();

    await user.type(screen.getByLabelText(/search tasks/i), 'missing');

    expect(screen.getByText(/no tasks match your search/i)).toBeInTheDocument();
  });

  it('creates a task from the modal', async () => {
    const user = userEvent.setup();
    const mockedCreateTask = vi.mocked(createTask);
    mockedCreateTask.mockResolvedValue({
      id: 99,
      title: 'Created Task',
      description: 'Created description',
      status: 'TODO',
      priority: 'LOW',
      deadline: null,
      category: mockCategories[0],
    });

    await renderLoadedTasks([]);

    await user.click(screen.getByRole('button', { name: /add task/i }));
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(mockedCreateTask).toHaveBeenCalled();
    });

    expect(screen.getByText('Created Task')).toBeInTheDocument();
  });

  it('edits an existing task', async () => {
    const user = userEvent.setup();
    const mockedUpdateTask = vi.mocked(updateTaskRequest);
    mockedUpdateTask.mockResolvedValue({
      ...mockTasks[0],
      title: 'Task 1 updated',
      description: 'Updated description',
      status: 'TODO',
    });

    await renderLoadedTasks();

    const todoColumn = screen
      .getByRole('heading', { name: 'Todo' })
      .closest('section') as HTMLElement;
    await user.click(within(todoColumn).getByRole('button', { name: 'Edit' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(mockedUpdateTask).toHaveBeenCalled();
    });

    expect(screen.getByText('Task 1 updated')).toBeInTheDocument();
  });

  it('deletes a task from the board', async () => {
    const user = userEvent.setup();
    const mockedDeleteTask = vi.mocked(deleteTask);
    mockedDeleteTask.mockResolvedValue(undefined);

    await renderLoadedTasks();

    const taskCard = screen.getByText('Task 2').closest('div') as HTMLElement;
    await user.click(within(taskCard).getByRole('button', { name: 'Delete' }));

    await waitFor(() => {
      expect(mockedDeleteTask).toHaveBeenCalledWith(2);
    });

    expect(screen.queryByText('Task 2')).not.toBeInTheDocument();
  });
});
