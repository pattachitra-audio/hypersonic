import { ResultAsync } from "neverthrow";

export interface JSONSerializable<T> {
    serializeToJSON(obj: T): ResultAsync<unknown, unknown>;
}
