import z from "zod";

export const InputSchema = z.object({
    idToken: z.string(),
});
