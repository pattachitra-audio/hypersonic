import { ResultAsync } from "neverthrow";

export interface Creator<T> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    create: (...args: any[]) => ResultAsync<T, unknown>;
}
