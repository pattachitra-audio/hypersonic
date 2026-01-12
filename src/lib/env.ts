import z from "zod";
import NoThrow from "neverthrow";

const EnvSchema = z.object({
    MONGODB_URI: z.string(),
});

export type EnvSchemaType = z.infer<typeof EnvSchema>;

export const envPromise = (async function () {
    const result = await EnvSchema.safeParseAsync(process.env);

    if (result.success) {
        return new NoThrow.Ok(result.data);
    }

    return new NoThrow.Err(result.error);
})();
