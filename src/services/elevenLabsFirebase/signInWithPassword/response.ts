import z from "zod";

export const ResponseSchema = z
    .object({
        idToken: z.string(),
        email: z.email(),
        refreshToken: z.string(),
        expiresIn: z.coerce.number(),
        localId: z.string(),
        registered: z.boolean(),
    })
    .transform(({ localId: localID, ...rest }) => ({
        localID,
        ...rest,
    }));
