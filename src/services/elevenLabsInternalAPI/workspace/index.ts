import { ELEVEN_LABS_INTERNAL_API_BASE_URL } from "../constants";
import { RequestType } from "./request";
import { proxyAgentPool } from "@/lib/proxyAgentPool";
import { requestHeaders } from "@/requestHeaders";
import { ResponseSchema } from "./response";
import { undiciFetch } from "@/utils/undiciFetch";
import { parseResponseJSON } from "@/utils/parseResponseJSON";
import { zodParse } from "@/utils/zodParse";

export function workspace(input: RequestType) {
    const url = `${ELEVEN_LABS_INTERNAL_API_BASE_URL}/workspace`;

    return undiciFetch(url, {
        headers: {
            ...requestHeaders,
            "Cache-Control": "no-cache",
            Authorization: `Bearer ${input.bearerToken}`,
        },
        dispatcher: proxyAgentPool.get(input.proxyURL),
    })
        .andThen((response) => parseResponseJSON(response))
        .andThen((obj) => zodParse(ResponseSchema, obj));
}
