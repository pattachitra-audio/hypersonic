// import { Err, Ok } from "neverthrow";
import z from "zod";
import { err, ok } from "neverthrow";
import type { Result, ResultAsync } from "neverthrow";

export const NoThrow = {
    err,
    ok,

    fromZodResultType<T>(result: z.ZodSafeParseResult<T>) {
        if (!result.success) {
            return NoThrow.err(result.error);
        }

        return NoThrow.ok(result.data);
    },
};

export { Result, ResultAsync };
