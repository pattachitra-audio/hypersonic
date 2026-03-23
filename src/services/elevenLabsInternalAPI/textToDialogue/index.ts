import { ELEVEN_LABS_INTERNAL_API_BASE_URL } from "../constants";
import { Response, fetch as undiciFetch } from "undici";
import { RequestSchema, RequestType } from "./request";
import { requestHeaders } from "@/requestHeaders";
import { proxyAgentPool } from "@/lib/proxyAgentPool";
import { NoThrow } from "@/utils/NoThrow";
import { ResponseMetadataSchema } from "./response";

// TODO: handle errors properly
export async function textToDialogue(input: RequestType) {
    const inputValidationResult = await RequestSchema.safeDecodeAsync(input);

    if (!inputValidationResult.success) {
        return NoThrow.error(inputValidationResult.error);
    }

    const validatedInput = inputValidationResult.data;

    const url = `${ELEVEN_LABS_INTERNAL_API_BASE_URL}/text-to-dialogue`;
    let response: Response;

    const queryParams = new URLSearchParams();
    queryParams.append("output_format", validatedInput.outputFormat);

    try {
        response = await undiciFetch(`${url}?${queryParams.toString()}`, {
            method: "POST",
            body: JSON.stringify({
                inputs: validatedInput.inputs.map((input) => ({ text: input.text, voice_id: input.voiceID })),
                model_id: validatedInput.modelID,
                settings: {
                    stability: validatedInput.settings.stability,
                },
            }),
            headers: {
                ...requestHeaders,
                "content-type": "application/json",
                "cache-control": "no-cache",
                authorization: `Bearer ${validatedInput.bearerToken}`,
            },
            dispatcher: proxyAgentPool.get(validatedInput.proxyURL),
        });

        // console.log("response status:", response.status);
        // const headers = Array.from(response.headers.entries());
        // console.log("headers:", headers);

        if (response.status !== 200) {
            NoThrow.error(new Error("Response status !== 200"));
        }
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

    try {
        const buffer = await response.arrayBuffer();
        const headers = response.headers;

        const metadataResult = await ResponseMetadataSchema.safeParseAsync({
            generationInfo: headers.get("generation-info"),
            historyItemID: headers.get("history-item-id"),
            cost: headers.get("character-cost"),
            requestID: headers.get("request-id"),
            regenerationCount: headers.get("regeneration-count"),
        });

        if (!metadataResult.success) {
            return NoThrow.error(metadataResult.error);
        }

        return NoThrow.ok({
            ...metadataResult.data,
            buffer,
        });
    } catch (error) {
        return NoThrow.error(new Error("Unknown error"));
    }
}
