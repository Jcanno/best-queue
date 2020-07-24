import { createQueue } from '../src/index';
import { genPromise } from './utils';

describe('one concurrence task running result', () => {
	let queue;

	function initQueue() {
		queue = createQueue({
			max: 1
		});
		
		queue.add(genPromise(100));
		queue.run();
	}

	beforeEach(() => {
		initQueue();
	});

	test('get one task result and finish state', () => {
		return queue.result().then(res => {
			const state = queue.getState();

			expect(state).toBe('finish');
			expect(res).toEqual([100]);
		});
	});
});

describe('one more concurrence tasks running result', () => {
	let queue;

	function initQueue() {
		queue = createQueue({
			max: 2
		});
		
		queue.add(genPromise(100));
	}

	beforeEach(() => {
		initQueue();
	});

	test('get two task result', () => {
		queue.add(genPromise(200));
		queue.run();
		return queue.result().then(res => {
			expect(res).toEqual([100, 200]);
		});
	});

	test('can add array tasks and order in result', () => {
		queue.add([
			genPromise(300),
			genPromise(200)
		]);
		queue.run();
		return queue.result().then(res => {
			expect(res).toEqual([100, 300, 200]);
		});
	});

	test('can add array tasks and order in result', () => {
		queue.add([
			genPromise(200),
			genPromise(300),
			genPromise(400),
			genPromise(500),
			genPromise(600),
			genPromise(700),
			genPromise(800),
			genPromise(900)
		]);
		queue.run();
		return queue.result().then(res => {
			expect(res).toEqual([
				100, 200, 300,
				400, 500, 600,
				700, 800, 900
			]);
		});
	});

	test('correct result order after adding priority', () => {
		queue.add(genPromise(300), -1);
		queue.add(genPromise(200));
		queue.run();
		return queue.result().then(res => {
			expect(res).toEqual([100, 200, 300]);
		});
	});
});
