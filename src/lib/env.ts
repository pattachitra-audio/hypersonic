import { zodParse } from "@/utils/zodParse";
import { ResultAsync } from "neverthrow";
import z from "zod";

const EnvSchema = z.object({
    MONGODB_URI: z.string(),
    REDIS_URL: z.string(),
});

export type EnvSchemaType = z.infer<typeof EnvSchema>;

export const envPromise = (function () {
    /* return zodParse(EnvSchema, process.env).match(
        (value) => okAsync(value),
        (error) => errAsync(error),
    ); */
    // return zodParse(EnvSchema, process.env);
    return new ResultAsync(Promise.resolve(zodParse(EnvSchema, process.env)));
})();

// TODO: Learn about the .match function
