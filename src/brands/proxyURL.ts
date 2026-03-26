import z from "zod";
import { Brand } from "@/utils/brand";
import { ok, err, Result } from "neverthrow";

export type ProxyURLBrand = Brand<`http://${string}:${string}@${string}:${number}`, "ProxyURL">;

export function parseProxyURL(proxyURL: string): Result<ProxyURLBrand, string> {
    if (proxyURL.startsWith("http://")) {
        proxyURL = proxyURL.slice(7); // "http://" is 7 chars, not 6
    }

    const parts = proxyURL.split("@");

    if (parts.length !== 2) {
        return err(`Invalid proxy url: expected format '[http://]<username>:<password>@<host>:<port>'`);
    }

    const [credentials, hostPort] = parts;

    const credParts = credentials.split(":");
    if (credParts.length !== 2 || !credParts[0] || !credParts[1]) {
        return err(`Invalid user info: expected format '<username>:<password>'`);
    }

    const hostParts = hostPort.split(":");
    if (hostParts.length !== 2 || !hostParts[0] || !hostParts[1]) {
        return err(`Invalid host-port: expected format '<host>:<port>'`);
    }

    const port = Number(hostParts[1]);

    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        return err(`Invalid port: must be an integer between 1 and 65535, found: ${port}`);
    }

    return createProxyURL(credParts[0], credParts[1], hostParts[0], port);
}

export function createProxyURL(
    username: string,
    password: string,
    host: string,
    port: number,
): Result<ProxyURLBrand, string> {
    /*
    if (!username) {
        return err(`Username cannot be empty`);
    }
    if (username.length > 255) {
        return err(`Username cannot exceed 255 characters`);
    }
    if (/[^a-zA-Z0-9._~!$&'()*+,;=\-]/.test(username)) {
        return err(`Username contains invalid characters`);
    }

    if (!password) {
        return err(`Password cannot be empty`);
    }
    if (password.length > 255) {
        return err(`Password cannot exceed 255 characters`);
    }
    if (/[^a-zA-Z0-9._~!$&'()*+,;=\-]/.test(password)) {
        return err(`Password contains invalid characters`);
    }

    if (!host) {
        return err(`Host cannot be empty`);
    }
    if (host.length > 253) {
        return err(`Host cannot exceed 253 characters`);
    }

    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const hostnameRegex = /^(?!-)([a-zA-Z0-9-]{1,63}(?<!-)\.)*[a-zA-Z]{2,63}$/;
    const ipv6Regex = /^\[[\da-fA-F:]+\]$/;

    const ipv4Match = host.match(ipv4Regex);

    if (ipv4Match) {
        const octets = [ipv4Match[1], ipv4Match[2], ipv4Match[3], ipv4Match[4]];
        if (octets.some((o) => parseInt(o, 10) > 255)) {
            return err("Invalid IPv4 address: octet out of range");
        }
    } else if (!hostnameRegex.test(host) && !ipv6Regex.test(host)) {
        return err("Host must be a valid hostname, IPv4, or bracketed IPv6 address");
    }

    if (!Number.isInteger(port)) {
        return err("Port must be an integer");
    }
    if (port < 1 || port > 65535) {
        return err("Port must be between 1 and 65535");
    }

    const encodedUsername = encodeURIComponent(username);
    const encodedPassword = encodeURIComponent(password);

    return ok(`http://${encodedUsername}:${encodedPassword}@${host}:${port}` as ProxyURLBrand);
    */

    return ok(`http://${username}:${password}@${host}:${port}` as ProxyURLBrand);
}

export const ProxyURLSchema = z.string().transform((value, context) => {
    const result = parseProxyURL(value);

    if (result.isErr()) {
        context.addIssue(result.error);
        return z.NEVER;
    }

    return result.value;
});
