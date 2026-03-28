import { requestHeaders } from "@/requestHeaders";
import { ELEVEN_LABS_FIREBASE_API_KEY } from "../constants";
import { RequestType } from "./request";
import { ResponseSchema } from "./response";
import { undiciFetch } from "@/utils/undiciFetch";
import { parseResponseJSON } from "@/utils/parseResponseJSON";
import { zodParse } from "@/utils/zodParse";

export async function exchangeRefreshTokenForIDToken(req: RequestType) {
    const data = new URLSearchParams();
    data.append("grant_type", "refresh_token");
    data.append("refresh_token", req.refreshToken);

    const url = `https://securetoken.googleapis.com/v1/token?key=${ELEVEN_LABS_FIREBASE_API_KEY}`;

    undiciFetch(url, {
        method: "POST",
        body: data.toString(),
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            ...requestHeaders,
        },
    })
        .andThen(parseResponseJSON)
        .andThen((obj) => zodParse(ResponseSchema, obj));
}
