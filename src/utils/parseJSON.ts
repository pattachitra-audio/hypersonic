import { err, ok, Result } from "neverthrow";

export function parseJSON(jsonString: string): Result<unknown, SyntaxError | TypeError | Error> {
    try {
        return ok(JSON.parse(jsonString));
    } catch (error) {
        if (error instanceof SyntaxError || error instanceof TypeError) {
            return err(error);
        }
        return err(new Error("Unknown error while parsing json", { cause: error }));
    }
}
