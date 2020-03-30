const Queue = require('../queue-request')
const assert = require('assert');

describe('# options', function() {
	let queue = new Queue();

	describe('empty options', function() {
		it('should return empty object when options is empty', function() {
			assert.equal(JSON.stringify(queue.options), '{}');
		})
	})

	describe('default options', function() {
		it('default options max: 1, interval: 0, cb: () => {}', function() {
			assert.equal(queue.max, 1);
			assert.equal(queue.interval, 0);
			assert.equal(JSON.stringify(queue.cb), JSON.stringify(function() {}));
		})
	})
})

describe('# Add', function() {
	let queue;

	beforeEach(function() {
    queue = new Queue();
  });


	describe('task is function', function() {
		it('every task should be function', function() {
			queue.Add('test task');
			assert.equal(typeof queue._waiting[0], 'function');
		})
	});
})