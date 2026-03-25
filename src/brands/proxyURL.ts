import { Brand } from "@/utils/brand";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { NoThrow } from "@/utils/NoThrow";
import z from "zod";

export type ProxyURLBrand = Brand<`http://${string}:${string}@${string}:${string}`, "ProxyURL">;

export function parseProxyURL(proxyURL: string) {
    if (proxyURL.startsWith("http://")) {
        proxyURL = proxyURL.slice(7); // "http://" is 7 chars, not 6
    }

    const parts = proxyURL.split("@");

    if (parts.length !== 2) {
        return NoThrow.createError("Invalid proxy URL: expected format user:pass@host:port");
    }

    const [credentials, hostPort] = parts;

    const credParts = credentials.split(":");
    if (credParts.length !== 2 || !credParts[0] || !credParts[1]) {
        return NoThrow.createError("Invalid proxy URL: expected username:password");
    }

    const hostParts = hostPort.split(":");
    if (hostParts.length !== 2 || !hostParts[0] || !hostParts[1]) {
        return NoThrow.createError("Invalid proxy URL: expected host:port");
    }

    const port = Number(hostParts[1]);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        return NoThrow.createError("Invalid proxy URL: port must be an integer between 1 and 65535");
    }

    return createProxyURL(credParts[0], credParts[1], hostParts[0], port);
}

export function createProxyURL(username: string, password: string, host: string, port: number) {
    return NoThrow.success(`http://${username}:${password}@${host}:${port}` as ProxyURLBrand);
}

export const ProxyURLSchema = z.string().transform((value, context) => {
    const result = parseProxyURL(value);

    if (result.isErr()) {
        context.addIssue(getErrorMessage(result.error));
        return z.NEVER;
    }

    return result.value;
});
