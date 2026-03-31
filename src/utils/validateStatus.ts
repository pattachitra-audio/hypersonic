import { Response } from "undici";
import { ok, err } from "neverthrow";
import { parseResponseArrayBuffer } from "./parseResponseArrayBuffer";
import { parseStringFromArrayBuffer } from "./parseStringFromArrayBuffer";
import { parseJSON } from "./parseJSON";

export function validateStatus(response: Response) {
    if (200 <= response.status && response.status < 300) {
        return ok(response);
    }

    // parseResponseArrayBuffer(response).andThen(parseStringFromArrayBuffer).andThen(parseJSON);
    // parseResponseArrayBuffer(response).andThen(parseStringFromArrayBuffer).andThen(parseJSON);

    return err(new Error(`Response status: ${response.status}`));
}
