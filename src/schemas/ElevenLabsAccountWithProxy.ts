import z from "zod";

export const ElevenLabsAccountWithProxySchema = z.object({
    email: z.email(),
    password: z.string(),
    apiKey: z.string().regex(/^sk_[0-9a-f]{48}$/),
    proxy: z.object({
        host: z.ipv4(),
        port: z.int().min(1024).max(65535),
        username: z.string(),
        password: z.string(),
    }),
});

export type ElevenLabsAccountWithProxy = z.infer<typeof ElevenLabsAccountWithProxySchema>;
