import { ELEVEN_LABS_INTERNAL_API_BASE_URL } from "../constants";
import { Response, fetch as undiciFetch } from "undici";
import { RequestType } from "./request";
import { requestHeaders } from "@/requestHeaders";
import { proxyAgentPool } from "@/lib/proxyAgentPool";
import { NoThrow } from "@/utils/NoThrow";
import { ResponseSchema } from "./response";

export async function enhanceDialogue(req: RequestType) {
    const url = `${ELEVEN_LABS_INTERNAL_API_BASE_URL}/enhance-dialogue`;
    let response: Response;

    try {
        response = await undiciFetch(url, {
            method: "POST",
            body: JSON.stringify({ dialogue_blocks: req.dialogueBlocks }),
            headers: {
                ...requestHeaders,
                "Content-Type": "application/json",
                "Cache-Control": "no-cache",
                Authorization: `Bearer ${req.bearerToken}`,
            },
            dispatcher: proxyAgentPool.get(req.proxyURL),
        });
    } catch (error) {
        if (error instanceof TypeError) {
            return NoThrow.error(error);
        }

        if (error instanceof SyntaxError) {
            return NoThrow.error(error);
        }

        if (error instanceof DOMException) {
            return NoThrow.error(error);
        }

        return NoThrow.error(new Error("Unknown error"));
    }

    let rawData: unknown;

    try {
        rawData = await response.json();
    } catch (error) {
        if (error instanceof TypeError) {
            return NoThrow.error(error);
        }

        if (error instanceof SyntaxError) {
            return NoThrow.error(error);
        }

        if (error instanceof DOMException) {
            return NoThrow.error(error);
        }

        return NoThrow.error(new Error("Unknown error"));
    }

    console.log("rawData:", JSON.stringify(rawData, null, 4));
    const validatedDataResult = await ResponseSchema.safeParseAsync(rawData);

    if (!validatedDataResult.success) {
        return NoThrow.error(validatedDataResult.error);
    }

    return NoThrow.ok(validatedDataResult.data);
}
