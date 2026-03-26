import { ResultAsync } from "neverthrow";
import { Response } from "undici";

type JSONParseErrorTypes = SyntaxError | TypeError | DOMException | Error;

export function parseResponseJSON(response: Response): ResultAsync<unknown, JSONParseErrorTypes> {
    return ResultAsync.fromPromise(response.json(), (error) => {
        if (error instanceof SyntaxError || error instanceof TypeError || error instanceof DOMException) {
            return error;
        }

        return new Error("Unknown error parsing response as JSON", { cause: error });
    });
}
