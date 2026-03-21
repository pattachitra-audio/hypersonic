import { fetch as undiciFetch, Response } from "undici";
import { ELEVEN_LABS_INTERNAL_API_BASE_URL } from "../constants";
import { RequestType } from "./request";
import { NoThrow } from "@/utils/NoThrow";
import { proxyAgentPool } from "@/lib/proxyAgentPool";
import { requestHeaders } from "@/requestHeaders";
import { ResponseSchema } from "./response";
import fs from "node:fs";

export async function workspace(req: RequestType) {
    const url = `${ELEVEN_LABS_INTERNAL_API_BASE_URL}/workspace`;

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

    fs.writeFileSync("workspaceResponse.json", JSON.stringify(rawData, null, 4));

    return NoThrow.fromZodResultType(await ResponseSchema.safeParseAsync(rawData));
}
