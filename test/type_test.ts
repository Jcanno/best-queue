import { Expect, Equal } from './utils/index'
import { QueueResult } from './../src/index'

// tuple test
type TupleType = [number, string]
type TupleTypeResult = QueueResult<TupleType>

type TupleCase = [Expect<Equal<TupleTypeResult, [number, string]>>]

// array test
type ArrayType = number[]
type ArrayTypeResult = QueueResult<ArrayType>

type ArrayCase = [Expect<Equal<ArrayTypeResult, number[]>>]

// func promise tuple test
type FuncPromiseReturnTupleType = [() => Promise<[number, string]>, boolean]
type FuncPromiseReturnTupleTypeTypeResult = QueueResult<FuncPromiseReturnTupleType>

type FuncPromiseReturnTupleCase = [
  Expect<Equal<FuncPromiseReturnTupleTypeTypeResult, [[number, string], boolean]>>,
]

// promise tuple test
type PromiseReturnTupleType = [Promise<[number, string]>, boolean]
type PromiseReturnTupleTypeTypeResult = QueueResult<PromiseReturnTupleType>

type PromiseReturnTupleCase = [
  Expect<Equal<PromiseReturnTupleTypeTypeResult, [[number, string], boolean]>>,
]

// primitive type test
// note that QueueResult argument required extends Array, so can't be primitive type in queue.
// but QueueResult also supports this case
type PrimitiveType = number
type PrimitiveTypeResult = QueueResult<PrimitiveType>

type PrimitiveTypeCase = [Expect<Equal<PrimitiveTypeResult, number[]>>]

type TestCases = [
  TupleCase,
  ArrayCase,
  FuncPromiseReturnTupleCase,
  PromiseReturnTupleCase,
  PrimitiveTypeCase,
]

export { TestCases }
