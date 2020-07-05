
/**
 * @param val the val to instpect
 * @returns true if val is a promise
 */
export function isPromise(val): boolean {
	return (
		val !== undefined &&
		val !== null &&
		typeof val.then === 'function' &&
		typeof val.catch === 'function'
	);
}
