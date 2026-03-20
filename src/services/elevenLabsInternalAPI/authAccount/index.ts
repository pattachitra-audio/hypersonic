import { requestHeaders } from "@/requestHeaders";
import { ELEVEN_LABS_INTERNAL_API_BASE_URL } from "../constants";
import { RequestType } from "./request";
import { Response, fetch as undiciFetch } from "undici";
import { proxyAgentPool } from "@/lib/proxyAgentPool";
import { NoThrow } from "@/utils/NoThrow";
import { ResponseSchema } from "./response";

export async function authAccount(req: RequestType) {
    const url = `${ELEVEN_LABS_INTERNAL_API_BASE_URL}/auth-account`;
    let response: Response;

    try {
        response = await undiciFetch(url, {
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

    let rawData: unknown;

    try {
        rawData = await response.json();
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

    console.log("JSON:", JSON.stringify(rawData, null, 4));
    const validatedDataResult = await ResponseSchema.safeParseAsync(rawData);

    if (!validatedDataResult.success) {
        return NoThrow.err(validatedDataResult.error);
    }

    return NoThrow.ok(validatedDataResult.data);
}
