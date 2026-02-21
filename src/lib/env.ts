import z from "zod";
import NoThrow from "@/utils/NoThrow";

const EnvSchema = z.object({
    MONGODB_URI: z.string(),
});

export type EnvSchemaType = z.infer<typeof EnvSchema>;

export const envPromise = (async function () {
    const result = await EnvSchema.safeParseAsync(process.env);

    if (result.success) {
        return NoThrow.ok(result.data);
    }

    return NoThrow.err(result.error);
})();
