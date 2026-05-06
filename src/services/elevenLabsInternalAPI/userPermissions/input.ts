import z from "zod";

export const InputSchema = z.object({
    bearerToken: z.string(),
});
