import { err, ok, Result } from "neverthrow";
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
