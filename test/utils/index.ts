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
			}, time);
		});
	};
}

export {
	genRejectPromise,
	genPromise
};
