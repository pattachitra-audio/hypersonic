import z from "zod";
import { err, ok } from "neverthrow";
import type { Result, ResultAsync } from "neverthrow";

export const NoThrow = {
    error: err,
    success: ok,

    fromZodResult<T>(result: z.ZodSafeParseResult<T>) {
        if (!result.success) {
            return err(result.error);
        }

        return ok(result.data);
    },
    createError(message: string, options: ErrorOptions) {
        return err(new Error(message, options));
    },
};

export { Result, ResultAsync };
