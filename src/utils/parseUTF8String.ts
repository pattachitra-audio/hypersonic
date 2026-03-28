import { ok } from "neverthrow";

export function parseUTF8String(buffer: Buffer<ArrayBuffer>) {
    return ok(buffer.toString("utf8"));
}
