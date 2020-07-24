import { createQueue } from '../src/index';
import { genPromise } from './utils';

describe('resume paused queue', () => {
	test('rerun the queue', () => {
		const queue = createQueue({
			max: 1,
			taskCb: () => {
				queue.pause();
			}
		});
		
		queue.add([
			genPromise(100),
			genPromise(200)
		]);
		queue.run();

		function finalPromise() {
			return new Promise(resolve => {
				queue.result().then(result => {
					const state = queue.getState();
		
					expect(state).toBe('pause');
					expect(result).toEqual([100]);
		
					queue.resume();
					queue.result().then(res => {
						const state = queue.getState();
		
						expect(state).toBe('finish');
						expect(res).toEqual([100, 200]);
						resolve();
					});
				});
			});
		}

		return finalPromise();
	});
});
