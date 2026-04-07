import { ELEVEN_LABS_INTERNAL_API_BASE_URL } from "../constants";
import { RequestType } from "./request";
import { requestHeaders } from "@/requestHeaders";
import { proxyAgentPool } from "@/lib/proxyAgentPool";
import { ResponseSchema } from "./response";
import { undiciFetch } from "@/utils/undiciFetch";
import { parseResponseJSON } from "@/utils/parseResponseJSON";
import { zodParse } from "@/utils/zodParse";

export async function enhanceDialogue(req: RequestType) {
    const url = `${ELEVEN_LABS_INTERNAL_API_BASE_URL}/enhance-dialogue`;

    return undiciFetch(url, {
        method: "POST",
        body: JSON.stringify({ dialogue_blocks: req.dialogueBlocks }),
        headers: {
            ...requestHeaders,
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            Authorization: `Bearer ${req.bearerToken}`,
        },
        dispatcher: proxyAgentPool.get(req.proxyURL),
    })
        .andThen(parseResponseJSON)
        .andThen((obj) => zodParse(ResponseSchema, obj));
}
