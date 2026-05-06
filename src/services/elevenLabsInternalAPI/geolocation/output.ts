import z from "zod";

export const OutputSchema = z
    .object({
        data: z.object({
            country: z.string(),
            region: z.string(),
            city: z.string(),
        }),
    })
    .transform(({ data }) => data);
