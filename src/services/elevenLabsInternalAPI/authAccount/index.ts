import { requestHeaders } from "@/requestHeaders";
import { ELEVEN_LABS_INTERNAL_API_BASE_URL } from "../constants";
import { RequestType } from "./request";
import { proxyAgentPool } from "@/lib/proxyAgentPool";
import { ResponseSchema } from "./response";
import { undiciFetch } from "@/utils/undiciFetch";
import { parseResponseJSON } from "@/utils/parseResponseJSON";
import { zodParse } from "@/utils/zodParse";

export async function authAccount(req: RequestType) {
    const url = `${ELEVEN_LABS_INTERNAL_API_BASE_URL}/auth-account`;

    return undiciFetch(url, {
        headers: {
            ...requestHeaders,
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            Authorization: `Bearer ${req.bearerToken}`,
        },
        dispatcher: proxyAgentPool.get(req.proxyURL),
    })
        .andThen((response) => parseResponseJSON(response))
        .andThen((obj) => zodParse(ResponseSchema, obj));
}
