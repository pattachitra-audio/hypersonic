import { ResultAsync } from "neverthrow";

export interface JSONDeserializable<T> {
    deserializeFromJSON(json: unknown): ResultAsync<T, unknown>;
}
