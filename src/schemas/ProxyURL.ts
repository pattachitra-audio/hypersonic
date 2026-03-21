import z from "zod";

export type ProxyURLType = `http://${string}:${string}@${string}:${string}`;

export const ProxyURLSchema = z
    .string()
    .regex(
        /^http:\/\/[^:]+:[^@]+@[^:]+:\d+$/,
        "Must be a valid proxy URL in the format http://<username>:<password>@<host>:<port>",
    ) as z.ZodType<ProxyURLType>;
