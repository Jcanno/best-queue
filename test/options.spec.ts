import { createQueue } from '../src/index';

describe('type and value check', () => {
	test('max min to 1, interval min to 0', () => {
		expect(() => {
			createQueue({
				max: 0
			});
		}).toThrowError('Except max min to 1, interval min to 0');
		expect(() => {
			createQueue({
				interval: -1
			});
		}).toThrowError('Except max min to 1, interval min to 0');
	});

	test('can not call result with empty queue', () => {
		const queue = createQueue({
			max: 1
		});
		
		expect(() => {
			queue.result();
		}).toThrowError('should add task and run the currentQueue');
	});
});
