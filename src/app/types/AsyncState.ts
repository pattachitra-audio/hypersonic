export type AsyncStateType<T, E = Error> = PendingAsyncStateType | ErrorAsyncStateType<E> | SuccessAsyncStateType<T>;
export type PendingAsyncStateType = { status: "pending" };
export type ErrorAsyncStateType<E> = { status: "error"; error: E };
export type SuccessAsyncStateType<T> = { status: "success"; data: T };
