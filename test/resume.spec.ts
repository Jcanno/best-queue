import { createQueue } from '../src/index';
import { genPromise } from './utils';

describe('resume paused queue', () => {
	test('rerun the queue', () => {
		const queue = createQueue({
			max: 1,
			taskCb: res => {
				if(res === 100) {
					queue.pause();
					const state = queue.getState();

					expect(state).toBe('pause');
				}
			}
		});
		
		queue.add([
			genPromise(100),
			genPromise(200)
		]);
		queue.run();
		setTimeout(() => {
			queue.resume();
		}, 300);
		function finalPromise() {
			return new Promise(resolve => {
				
				queue.result().then(result => {
					const state = queue.getState();
		
					expect(state).toBe('finish');
					expect(result).toEqual([100, 200]);
					resolve();
				});
			});
		}

		return finalPromise();
	});
});
