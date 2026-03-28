import { ResultAsync } from "neverthrow";
import { Response } from "undici";

type ArrayBufferParseErrorTypes = TypeError | Error;

export function parseResponseArrayBuffer(response: Response): ResultAsync<ArrayBuffer, ArrayBufferParseErrorTypes> {
    return ResultAsync.fromPromise(response.arrayBuffer(), (error) => {
        if (error instanceof TypeError || error instanceof Error) {
            return error;
        }

        return new Error("Unknown error parsing response as JSON", { cause: error });
    });
}
