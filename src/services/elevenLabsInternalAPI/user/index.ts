import { fetch as undiciFetch, Response } from "undici";
import { ELEVEN_LABS_INTERNAL_API_BASE_URL } from "../constants";
import { RequestType } from "./request";
import NoThrow from "@/utils/NoThrow";
import { proxyAgentPool } from "@/lib/proxyAgentPool";
import { requestHeaders } from "@/requestHeaders";
import { ResponseSchema } from "./response";

export async function user(req: RequestType) {
    const url = `${ELEVEN_LABS_INTERNAL_API_BASE_URL}/user/internal`;

    let response: Response;

    try {
        response = await undiciFetch(url, {
            headers: {
                ...requestHeaders,
                "Cache-Control": "no-cache",
                Authorization: `Bearer ${req.bearerToken}`,
            },
            dispatcher: proxyAgentPool.get(req.proxyURL),
        });
    } catch (error) {
        return NoThrow.err(error);
    }

    let rawData: unknown;

    try {
        rawData = await response.json();
    } catch (error) {
        return NoThrow.err(error);
    }

    const validatedDataResult = await ResponseSchema.safeParseAsync(rawData);

    if (!validatedDataResult.success) {
        return NoThrow.err(validatedDataResult.error);
    }

    return NoThrow.ok(validatedDataResult.success);
}
