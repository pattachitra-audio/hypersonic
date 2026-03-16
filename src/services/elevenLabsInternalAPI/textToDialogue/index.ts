import { ELEVEN_LABS_INTERNAL_API_BASE_URL } from "../constants";
import { Response, fetch as undiciFetch } from "undici";
import { RequestType } from "./request";
import { requestHeaders } from "@/requestHeaders";
import { proxyAgentPool } from "@/lib/proxyAgentPool";
import { NoThrow } from "@/utils/NoThrow";

// TODO: handle errors properly
export async function textToDialogue(req: RequestType) {
    const url = `${ELEVEN_LABS_INTERNAL_API_BASE_URL}/user`;
    let response: Response;

    try {
        response = await undiciFetch(url, {
            method: "POST",
            body: JSON.stringify({
                inputs: req.inputs.map((input) => ({ text: input.text, voice_id: input.voiceID })),
                model_id: req.modelID,
                settings: {
                    stability: req.settings.stability,
                },
            }),
            headers: {
                ...requestHeaders,
                "Content-Type": "application/json",
                "Cache-Control": "no-cache",
            },
            dispatcher: proxyAgentPool.get(req.proxyURL),
        });
    } catch (error) {
        if (error instanceof TypeError) {
            return NoThrow.err(error);
        }

        if (error instanceof SyntaxError) {
            return NoThrow.err(error);
        }

        if (error instanceof DOMException) {
            return NoThrow.err(error);
        }

        return NoThrow.err(new Error("Unknown error"));
    }

    let buffer: ArrayBuffer;

    try {
        buffer = await response.arrayBuffer();
    } catch (error) {
        return NoThrow.err(new Error("Unknown error"));
    }

    return NoThrow.ok(buffer);
}
