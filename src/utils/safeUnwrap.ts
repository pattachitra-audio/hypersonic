import { Result } from "neverthrow";

export function safeUnwrap<T>(result: Result<T, never>): T {
    return result._unsafeUnwrap();
}
