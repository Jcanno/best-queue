function genPromise(time) {
	return function() {
		return new Promise(r => {
			setTimeout(() => {
				r(time);
			}, time);
		});
	};
}

function genRejectPromise(time) {
	return function() {
		return new Promise((r, j) => {
			setTimeout(() => {
				j(time);
			}, typeof time === 'number' ? time : 100);
		});
	};
}

export {
	genRejectPromise,
	genPromise
};
