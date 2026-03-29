import { ProxyURLSchema } from "@/brands/proxyURL";
import z from "zod";

export const InputSchema = z.object({
    proxyURL: ProxyURLSchema,
    bearerToken: z.string(),

    searchQuery: z.string().optional(),
    sort: z.enum(["trending"]).default("trending"),
    pageSize: z.int().min(1).max(100).default(30),
    pageNum: z.int(),
});
