
/**
 * @param val the val to instpect
 * @returns true if val is a promise
 */
export function isPromise(val): val is Promise<any> {
	return (
		val !== undefined &&
		val !== null &&
		typeof val.then === 'function' &&
		typeof val.catch === 'function'
	);
}
