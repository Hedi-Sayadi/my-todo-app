export interface Task {
  id: number;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  deadline: string;
  category: string;
  completed: boolean;
}