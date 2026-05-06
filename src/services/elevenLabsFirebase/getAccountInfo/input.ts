import { ProxyURLSchema } from "@/brands/proxyURL";
import z from "zod";

export const InputSchema = z.object({
    idToken: z.string(),
    proxyURL: ProxyURLSchema,
});
