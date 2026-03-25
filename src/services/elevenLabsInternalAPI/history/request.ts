import { ProxyURLSchema } from "@/brands/proxyURL";
import z from "zod";

export const RequestSchema = z.object({
    proxyURL: ProxyURLSchema,
    bearerToken: z.string(),

    pageSize: z.number().min(1).max(1000).default(100),

    filters: z
        .object({
            startAfterHistoryItemID: z.string().optional(),
            voiceID: z.string().optional(),
            modelID: z.string().optional(),
            dateBeforeUnix: z.number().optional(),
            dateAfterUnix: z.number().optional(),
            sortDirection: z.enum(["ASC", "DESC"]).optional(),
            search: z.string().optional(),
            source: z.enum(["TTS", "STS"]).optional(),
        })
        .optional(),
});

export type RequestType = z.input<typeof RequestSchema>;
