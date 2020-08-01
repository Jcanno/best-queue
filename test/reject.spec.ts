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
		queue.add(genRejectPromise(100));
		queue.run();
		try {
			await queue.result();
		}catch(err) {
			const state = queue.getState();

			expect(state).toBe('error');
			expect(err).toBe(100);
		}
	});
});

describe('skip error', () => {
	test('skip one last error', () => {
		const queue = createQueue({
			max: 1,
			recordError: true
		});
		
		queue.add(genPromise(100));
		queue.add(genRejectPromise(200));
		queue.run();

		const err = new Error('200');

		return expect(queue.result()).resolves.toEqual([100, err]);
	});

	test('skip not one last error', () => {
		const queue = createQueue({
			max: 1,
			recordError: true
		});
		
		queue.add(genPromise(100));
		queue.add(genRejectPromise(200));
		queue.add(genPromise(100));
		queue.run();

		const err = new Error('200');

		return expect(queue.result()).resolves.toEqual([100, err, 100]);
	});

	test('skip not err instance', () => {
		const queue = createQueue({
			max: 1,
			recordError: true
		});
		const err = new Error('200');

		queue.add(genPromise(100));
		queue.add(genRejectPromise(err));
		queue.add(genPromise(100));
		queue.run();

		return expect(queue.result()).resolves.toEqual([100, err, 100]);
	});

	test('skip error in 2 concurrence', () => {
		const queue = createQueue({
			max: 2,
			recordError: true
		});
		const err = new Error('200');

		queue.add(genPromise(100));
		queue.add(genRejectPromise(err));
		queue.add(genPromise(100));
		queue.run();

		return expect(queue.result()).resolves.toEqual([100, err, 100]);
	});
});
