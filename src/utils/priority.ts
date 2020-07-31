import { TaskFn, Task } from '../types';

// Add priority to every task
export function addPriority(tasks: TaskFn, priority: number): Task {
	priority = typeof priority === 'number' ? priority : 0;
	const task = tasks as Task;

	task.priority = priority;
	return task;
}
