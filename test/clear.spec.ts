import { createQueue } from '../src/index';
import { genPromise } from './utils';

describe('clear queue', () => {
	test('init state after clear', () => {
		const queue = createQueue({
			max: 1
		});
		
		queue.add(genPromise(100));
		queue.run();
		return queue.result().then(() => {
			queue.clear();
			const state = queue.getState();

			expect(state).toBe('init');
		});
	});

	test('can clear when queue paused', () => {
		const queue = createQueue({
			max: 1,
			taskCb: () => {
				queue.pause();
				queue.clear();
			}
		});
		
		queue.add(genPromise(100));
		queue.add(genPromise(200));
		queue.run();
		return queue.result().then(res => {
			const state = queue.getState();

			expect(res).toEqual('CLEAR');
			expect(state).toBe('init');
		});
	});

	test('get empty array clear before result', () => {
		const queue = createQueue({
			max: 1
		});
		
		queue.add(genPromise(100));
		queue.add(genPromise(200));
		queue.run();
		queue.pause();
		queue.clear();
		return queue.result().then(res => {
			const state = queue.getState();

			expect(res).toEqual('CLEAR');
			expect(state).toBe('init');
		});
	});

	test('get empty array result before clear', done => {
		const queue = createQueue({
			max: 1
		});
		
		queue.add(genPromise(100));
		queue.add(genPromise(200));
		queue.run();
		
		function callback(res) {
			const state = queue.getState();

			expect(res).toEqual('CLEAR');
			expect(state).toBe('init');
			done();
		}
		
		queue.result().then(callback);
		queue.pause();
		queue.clear();
	});
  
	test('run queue after clear', done => {
		const queue = createQueue({
			max: 1,
			taskCb: (res, index) => {
				if(index === 0) {
					queue.clear();
				}
			}
		});
		
		queue.add(genPromise(100));
		queue.add(genPromise(200));
		queue.run();
		
		function callback(res) {
			const state = queue.getState();

			expect(res).toEqual('CLEAR');
			expect(state).toBe('init');
			queue.add(genPromise(300));
			queue.add(genPromise(400));
			queue.run();
      
			const state1 = queue.getState();

			expect(state1).toBe('running');
			queue.result().then(callback1);
			
		}
  
		function callback1(res) {
			expect(res).toEqual('CLEAR');
			done();
		}
		
		queue.result().then(callback);
	});
});
