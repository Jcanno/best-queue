const Queue = require('../queue-request')

describe('#option', function() {
	let queue = new Queue({});

	queue.Add('test')
	queue.Run()
	it('should return test', function(done) {
		queue.Result().then(() => done())
				.catch(err => done(err))
	})
})