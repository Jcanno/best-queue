import { Task, TaskWithPriority } from '../types';

// Add priority to every task
export function addPriority(tasks: Task, priority: number) {
	priority = typeof priority === 'number' ? priority : 0;
	const task = tasks as TaskWithPriority;

	task.priority = priority;
	return task;
}
