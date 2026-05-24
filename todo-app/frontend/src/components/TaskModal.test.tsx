import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskModal from './TaskModal';
import type { Category } from '../types/category';
import type { Task } from '../types/task';

const mockCategories: Category[] = [
  {
    id: 1,
    name: 'Work',
    description: '',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Personal',
    description: '',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
];

const mockTask: Task = {
  id: 1,
  title: 'Existing Task',
  description: 'Task Description',
  status: 'TODO',
  priority: 'HIGH',
  deadline: '2026-12-31',
  category: mockCategories[0],
};

describe('TaskModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when closed', () => {
    const { container } = render(
      <TaskModal
        isOpen={false}
        task={null}
        categories={mockCategories}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );

    const modal = container.querySelector('[class*="modal"]');
    expect(modal).toBeNull();
  });

  it('displays create task form when no task is provided', () => {
    render(
      <TaskModal
        isOpen={true}
        task={null}
        categories={mockCategories}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );

    const titleInput = screen.getByPlaceholderText('Enter task title');
    expect(titleInput).toBeInTheDocument();
    expect(titleInput).toHaveValue('');
  });

  it('populates form with existing task data for editing', () => {
    render(
      <TaskModal
        isOpen={true}
        task={mockTask}
        categories={mockCategories}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );

    const titleInput = screen.getByDisplayValue('Existing Task');
    const descInput = screen.getByDisplayValue('Task Description');

    expect(titleInput).toBeInTheDocument();
    expect(descInput).toBeInTheDocument();
  });

  it('calls onSave with form data when save button is clicked', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();

    const { container } = render(
      <TaskModal
        isOpen={true}
        task={null}
        categories={mockCategories}
        onClose={vi.fn()}
        onSave={onSave}
      />
    );

    const modal = container.querySelector('[class*="modal"]');
    if (modal) {
      const form = modal.querySelector('form');
      if (form) {
        const titleInput = form.querySelector('input[id="title"]') as HTMLInputElement;
        if (titleInput) {
          await user.type(titleInput, 'New Task');
          await user.click(form.querySelector('button[type="submit"]')!);
        }
      }
    }

    await waitFor(() => {
      expect(onSave).toHaveBeenCalled();
    });
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    const { container } = render(
      <TaskModal
        isOpen={true}
        task={null}
        categories={mockCategories}
        onClose={onClose}
        onSave={vi.fn()}
      />
    );

    const modal = container.querySelector('[class*="modal"]');
    if (modal) {
      const allButtons = modal.querySelectorAll('button');
      const closeButton = Array.from(allButtons).find((btn) =>
        /cancel|close|x/i.test(btn.textContent || '')
      );
      if (closeButton) await user.click(closeButton as HTMLElement);
    }

    expect(onClose).toHaveBeenCalled();
  });

  it('updates form when task prop changes', async () => {
    const { rerender } = render(
      <TaskModal
        isOpen={true}
        task={null}
        categories={mockCategories}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );

    rerender(
      <TaskModal
        isOpen={true}
        task={mockTask}
        categories={mockCategories}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );

    const titleInputs = screen.getAllByPlaceholderText('Enter task title');
    const titleInput = titleInputs.find((input) => input.getAttribute('value') === 'Existing Task');

    expect(titleInput).toBeInTheDocument();
  });

  it('selects category from dropdown', async () => {
    const user = userEvent.setup();

    render(
      <TaskModal
        isOpen={true}
        task={null}
        categories={mockCategories}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );

    const categorySelects = screen.getAllByRole('combobox');
    const categorySelect = categorySelects[0];

    if (categorySelect) {
      await user.click(categorySelect);
      await waitFor(() => {
        const options = screen.queryAllByRole('option');
        const personalOption = options.find((opt) => opt.textContent?.includes('Personal'));
        if (personalOption) return;
        throw new Error('Personal option not found');
      });

      const options = screen.getAllByRole('option');
      const personalOption = options.find((opt) => opt.textContent?.includes('Personal'));
      if (personalOption) await user.click(personalOption);
    }
  });
});
