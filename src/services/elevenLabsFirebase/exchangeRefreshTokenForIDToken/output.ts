import z from "zod";

export const OutputSchema = z
    .object({
        expires_in: z.string(),
        token_type: z.string(),
        refresh_token: z.string(),
        id_token: z.string(),
        user_id: z.string(),
        project_id: z.string(),
    })
    .transform((data) => ({
        expiresIn: parseInt(data.expires_in),
        tokenType: data.token_type,
        refreshToken: data.refresh_token,
        idToken: data.id_token,
        userID: data.user_id,
    }));
