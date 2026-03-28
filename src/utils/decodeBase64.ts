import { ok } from "neverthrow";

export function decodeBase64(encoded: string) {
    return ok(Buffer.from(encoded, "base64"));
}
