import z from "zod";

export const ElevenLabsAccountWithProxySchema = z.object({
    email: z.email(),
    password: z.string(),

    proxy: z.object({
        host: z.ipv4(),
        port: z.int().min(1024).max(65535),
        username: z.string(),
        password: z.string(),
    }),

    firebaseAuthCreds: z.object({
        refreshToken: z.string(),
    }),
});

export type ElevenLabsAccountWithProxy = z.infer<typeof ElevenLabsAccountWithProxySchema>;
