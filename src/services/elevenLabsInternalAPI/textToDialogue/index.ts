import { ELEVEN_LABS_INTERNAL_API_BASE_URL } from "../constants";
import { RequestSchema, RequestType } from "./request";
import { requestHeaders } from "@/requestHeaders";
import { proxyAgentPool } from "@/lib/proxyAgentPool";
import { zodParse } from "@/utils/zodParse";
import { undiciFetch } from "@/utils/undiciFetch";
import { parseResponseArrayBuffer } from "@/utils/parseResponseArrayBuffer";
import { ResponseMetadataSchema } from "./response";

export function textToDialogue(input: RequestType) {
    return zodParse(RequestSchema, input)
        .asyncAndThen((validatedInput) => {
            const url = `${ELEVEN_LABS_INTERNAL_API_BASE_URL}/text-to-dialogue`;

            const queryParams = new URLSearchParams();
            queryParams.append("output_format", validatedInput.outputFormat);

            return undiciFetch(`${url}?${queryParams.toString()}`, {
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
        })
        .andThen((response) => parseResponseArrayBuffer(response).map((buffer) => ({ response, buffer })))
        .andThen(({ response, buffer }) => {
            const headers = response.headers;

            return zodParse(ResponseMetadataSchema, {
                generationInfo: headers.get("generation-info"),
                historyItemID: headers.get("history-item-id"),
                cost: headers.get("character-cost"),
                requestID: headers.get("request-id"),
                regenerationCount: headers.get("regeneration-count"),
            }).map((metadata) => ({ metadata, buffer }));
        });
}
