import { requestHeaders } from "@/requestHeaders";
import { ELEVEN_LABS_FIREBASE_API_KEY } from "../constants";
import { RequestType } from "./request";
import { Response, fetch as undiciFetch } from "undici";
import { NoThrow } from "@/utils/NoThrow";
import { ResponseSchema } from "./response";

// TODO: Handle errors properly
export async function exchangeRefreshTokenForIDToken(req: RequestType) {
    const data = new URLSearchParams();
    data.append("grant_type", "refresh_token");
    data.append("refresh_token", req.refreshToken);

    const url = `https://securetoken.googleapis.com/v1/token?key=${ELEVEN_LABS_FIREBASE_API_KEY}`;

    let response: Response;

    try {
        response = await undiciFetch(url, {
            method: "POST",
            body: data.toString(),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                ...requestHeaders,
                Origin: "https://elevenlabs.io",
                Referer: "https://elevenlabs.io/",
            },
        });
    } catch (error) {
        return NoThrow.err(error);
    }

    let json: unknown;

    try {
        json = await response.json();

        if (response.status !== 200) {
            return NoThrow.err(new Error("Response status !== 200", { cause: json }));
        }
    } catch (error) {
        if (error instanceof SyntaxError) {
            return NoThrow.err(error);
        }

        return NoThrow.err(error);
    }

    const validatedDataResult = await ResponseSchema.safeParseAsync(json);

    if (!validatedDataResult.success) {
        return NoThrow.err(validatedDataResult.error);
    }

    return NoThrow.ok(validatedDataResult.data);
}
