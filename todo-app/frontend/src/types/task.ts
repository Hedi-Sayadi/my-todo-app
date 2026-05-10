export interface Task {
  id: number;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  deadline: string | null;
  category: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
}