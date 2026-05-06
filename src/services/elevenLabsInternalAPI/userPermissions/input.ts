import { ProxyURLSchema } from "@/brands/proxyURL";
import z from "zod";

export const InputSchema = z.object({
    proxyURL: ProxyURLSchema,
    bearerToken: z.string(),
});
