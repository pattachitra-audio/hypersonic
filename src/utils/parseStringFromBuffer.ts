import { ok } from "neverthrow";

export function parseStringFromBuffer(buffer: Buffer<ArrayBuffer>, encoding: BufferEncoding = "utf-8") {
    return ok(buffer.toString(encoding));
}
