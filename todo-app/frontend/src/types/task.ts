import type { Category } from './category';

export interface Task {
  id: number;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  deadline: string | null;
  category: Category;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
}
