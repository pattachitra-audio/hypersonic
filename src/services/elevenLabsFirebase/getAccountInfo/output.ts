import { getErrorMessage } from "@/utils/getErrorMessage";
import z from "zod";

export const OutputSchema = z.object({
    users: z.array(
        z.object({
            localId: z.string(),
            email: z.email(),
            passwordHash: z.base64(),
            emailVerified: z.boolean(),
            passwordUpdatedAt: z.coerce.date<number>(),
            providerUserInfo: z.array(
                z.object({
                    providerId: z.enum(["password"]),
                    // "federatedId": "sudo.code@pa.lordmx.com",
                    email: z.email(),
                    // "rawId": "sudo.code@pa.lordmx.com"
                }),
            ),
            validSince: z.coerce.number<string>().transform((v) => new Date(v * 1000)),
            lastLoginAt: z.coerce.number<string>().transform((v) => new Date(v)),
            createdAt: z.coerce.number<string>().transform((v) => new Date(v)),
            customAttributes: z.string().transform((value, ctx) => {
                try {
                    const json = JSON.parse(value);
                    const Schema = z
                        .object({
                            workspace_id: z.hex(),
                            workspace_user_id: z.string(),
                        })
                        .transform((v) => ({
                            workspaceID: v.workspace_id,
                            workspaceUserID: v.workspace_user_id,
                        }));

                    return Schema.parse(json);
                } catch (error) {
                    ctx.addIssue({
                        code: "custom",
                        message: getErrorMessage(error),
                    });
                    return z.NEVER;
                }
            }),
            lastRefreshAt: "2026-05-04T14:08:58.742Z",
        }),
    ),
});
