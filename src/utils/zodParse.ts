import { err, errAsync, ok, okAsync, Result, ResultAsync } from "neverthrow";
import z from "zod";

export function zodParse<Schema extends z.ZodType>(
    schema: Schema,
    obj: unknown,
): Result<z.infer<Schema>, z.ZodError<z.infer<Schema>>> {
    const result = schema.safeParse(obj);

    if (result.success) {
        return ok(result.data);
    }

    return err(result.error);
}

export function zodParseAsync<Schema extends z.ZodType>(
    schema: Schema,
    obj: unknown,
): ResultAsync<z.infer<Schema>, z.ZodError<z.infer<Schema>>> {
    return ResultAsync.fromSafePromise(schema.safeParseAsync(obj)).andThen((result) => {
        if (result.success) {
            return okAsync(result.data);
        }

        return errAsync(result.error);
    });
}
