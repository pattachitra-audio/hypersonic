import { proxyAgentPool } from "@/lib/proxyAgentPool";
import { RequestType } from "./request";
import { Response, fetch as undiciFetch } from "undici";
import { ResponseSchema } from "./response";
import { NoThrow } from "@/utils/NoThrow";
import { ELEVEN_LABS_FIREBASE_API_KEY } from "../constants";
import { requestHeaders } from "@/requestHeaders";

// Handle errors properly
export async function signInWithPassword(req: RequestType) {
    const body = JSON.stringify({ returnSecureToken: true, ...req });
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${ELEVEN_LABS_FIREBASE_API_KEY}`;

    let response: Response;

    try {
        response = await undiciFetch(url, {
            method: "POST",
            body,
            headers: {
                ...requestHeaders,
                "Content-Type": "application/json",
                Referer: "https://elevenlabs.io/app/sign-in",
                Origin: "https://elevenlabs.io",
            },
            dispatcher: proxyAgentPool.get(req.proxyURL),
        });
    } catch (error) {
        return NoThrow.createError(`Error fetching ${url}`, { cause: error });
    }

    let json: unknown;

    try {
        json = await response.json();

        if (response.status !== 200) {
            return NoThrow.error(new Error("Response status !== 200", { cause: json }));
        }
    } catch (error) {
        if (error instanceof SyntaxError) {
            return NoThrow.error(error);
        }

        return NoThrow.createError("Error parsing json", { cause: error });
    }

    const validatedDataResult = await ResponseSchema.safeParseAsync(json);

    if (!validatedDataResult.success) {
        return NoThrow.error(validatedDataResult.error);
    }

    return NoThrow.success(validatedDataResult.data);
}
