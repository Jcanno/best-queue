import { createQueue } from '../src/index';
import { genPromise, genRejectPromise } from './utils';

describe('one concurrence task running reject', () => {
	test('reject', () => {
		const queue = createQueue({
			max: 1
		});
		
		queue.add(genPromise(100));
		queue.add(genRejectPromise(200));
		queue.run();
		return expect(queue.result()).rejects.toBe(200);
	});
	
});

describe('one more concurrence tasks running reject', () => {
	test('one reject task', async() => {
		const queue = createQueue({
			max: 2
		});
		
		queue.add(genPromise(100));
		queue.add(genPromise(300));
		queue.add(genRejectPromise(200));
		queue.run();
		try {
			await queue.result();
		}catch(err) {
			const state = queue.getState();

			expect(state).toBe('error');
			expect(err).toBe(200);
		}
	});

	test('one more reject tasks', async() => {
		const queue = createQueue({
			max: 2
		});
		
		queue.add(genPromise(100));
		queue.add(genPromise(100));
		queue.add(genRejectPromise(200));
		queue.add(genRejectPromise(200));
		queue.run();
		try {
			await queue.result();
		}catch(err) {
			const state = queue.getState();

			expect(state).toBe('error');
			expect(err).toBe(200);
		}
	});
	
});
