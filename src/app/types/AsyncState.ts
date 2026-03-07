export type AsyncStateType<T, E = Error> = PendingAsyncStateType | ErrorAsyncStateType<E> | SuccessAsyncStateType<T>;
export type PendingAsyncStateType = { status: "PENDING" };
export type ErrorAsyncStateType<E> = { status: "ERROR"; error: E };
export type SuccessAsyncStateType<T> = { status: "SUCCESS"; data: T };
