import { ProxyURLType } from "@/schemas/ProxyURL";
import { NoThrow } from "./NoThrow";

export function parseProxyURL(proxyURL: string) {
    const pattern = /^http:\/\/.+:.+@.+:.+$/;

    if (!pattern.test(proxyURL)) {
        return NoThrow.err(
            new Error(`Invalid proxy url format '${proxyURL}'; Expected 'http://<username>:<password>@<host>:<port>`),
        );
    }

    return NoThrow.ok(proxyURL as ProxyURLType);
}
