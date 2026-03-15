import z from "zod";

export const ResponseSchema = z
    .object({
        idToken: z.string(),
        email: z.email(),
        refreshToken: z.string(),
        expiresIn: z.string(),
        localId: z.string(),
        registered: z.boolean(),
    })
    .transform(({ localId: localID, expiresIn, ...rest }) => ({
        localID,
        expiresIn: parseInt(expiresIn),
        ...rest,
    }));
