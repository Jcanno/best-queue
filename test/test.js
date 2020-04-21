const Queue = require('../index')
const assert = require('assert');
const axios = require('axios');

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

	describe('request is function', function() {
		it('every task should be function', function() {
			queue.Add('test request');
			assert.equal(typeof queue._waiting[0], 'function');
		})
	});

	describe('add url task', function() {
		it('url task should be a function return promise', function() {
			let url = 'https://www.npmjs.com';
			queue.Add(url);

			assert.notStrictEqual(queue._waiting[0], function() {
				return axios({
					url,
					method: 'get'
				})
			});
		})
	});

	describe('add not url request', function() {
		it('not url task should be itself', function() {
			const requests = [
				'hello',
				1,
				true,
				{
					name: 'Jacano'
				}
			]
			queue.Add(requests)

			assert.equal(queue._waiting[0](), requests[0]);
			assert.equal(queue._waiting[1](), requests[1]);
			assert.equal(queue._waiting[2](), requests[2]);
			assert.equal(queue._waiting[3](), requests[3]);
		})
	});

	describe('add array url request', function(){
		it('array url should be divided url request', function(){
			const requests = [
				'https://www.npmjs.com',
				'https://www.webpackjs.com',
				'https://cn.vuejs.org',
				'https://reactjs.org'
			]

			queue.Add(requests)

			for(i = 0; i < requests.length; i++) {
				assert.notStrictEqual(queue._waiting[i], function() {
					return axios(requests[i])
				});
			}
		})
	})

	describe('add url option', function() {
		it('url option task should be a function return promise', function() {
			let request = {
				url: 'https://www.npmjs.com',
				method: 'get'
			}
			queue.Add(request);

			assert.notStrictEqual(queue._waiting[0], function() {
				return axios(request)
			});
		})
	});
})

describe('# state', () => {
	let queue;

	beforeEach(function() {
    queue = new Queue();
	});
	
	describe('pause state', () => {
		it('state should not be pause when queue init', function() {
			queue.Pause();
			assert.notEqual(queue._state, 'pause')
		})
	})
	
})

describe('# result', () => {
	let queue;

	beforeEach(function() {
    queue = new Queue();
	});
	
	describe('empty result', () => {
		it('result should be empty array when queue task is empty', function() {
			queue.Result().then(res => {
				assert.notEqual(res, [])
			})
		})
	})
	
})
