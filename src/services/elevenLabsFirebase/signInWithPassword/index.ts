import { proxyAgentPool } from "@/lib/proxyAgentPool";
import { RequestType } from "./request";
import { ResponseSchema } from "./response";
import { ELEVEN_LABS_FIREBASE_API_KEY } from "../constants";
import { requestHeaders } from "@/requestHeaders";
import { undiciFetch } from "@/utils/undiciFetch";
import { parseResponseJSON } from "@/utils/parseResponseJSON";
import { zodParse } from "@/utils/zodParse";

export async function signInWithPassword(input: RequestType) {
    const body = JSON.stringify({ returnSecureToken: true, ...input });
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${ELEVEN_LABS_FIREBASE_API_KEY}`;

    return undiciFetch(url, {
        method: "POST",
        body,
        headers: {
            ...requestHeaders,
            "Content-Type": "application/json",
            Referer: "https://elevenlabs.io/app/sign-in",
            Origin: "https://elevenlabs.io",
        },
        dispatcher: proxyAgentPool.get(input.proxyURL),
    })
        .andThen(parseResponseJSON)
        .andThen((obj) => zodParse(ResponseSchema, obj));
}
