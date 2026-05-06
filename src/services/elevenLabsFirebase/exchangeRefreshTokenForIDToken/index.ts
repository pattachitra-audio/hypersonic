import z from "zod";
import { requestHeaders } from "@/requestHeaders";
import { ELEVEN_LABS_FIREBASE_API_KEY } from "../constants";
import { InputSchema } from "./input";
import { OutputSchema } from "./output";
import { undiciFetch } from "@/utils/undiciFetch";
import { parseResponseJSON } from "@/utils/parseResponseJSON";
import { zodParse, zodParseAsync } from "@/utils/zodParse";
import { proxyAgentPool } from "@/lib/proxyAgentPool";

export function exchangeRefreshTokenForIDToken(input: z.input<typeof InputSchema>) {
    return zodParseAsync(InputSchema, input).andThen(fn);
}

function fn(validatedInput: z.output<typeof InputSchema>) {
    const data = new URLSearchParams();
    data.append("grant_type", "refresh_token");
    data.append("refresh_token", validatedInput.refreshToken);

    const url = `https://securetoken.googleapis.com/v1/token?key=${ELEVEN_LABS_FIREBASE_API_KEY}`;

    return undiciFetch(url, {
        method: "POST",
        body: data.toString(),
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            ...requestHeaders,
        },
        dispatcher: proxyAgentPool.get(validatedInput.proxyURL),
    })
        .andThen(parseResponseJSON)
        .andThen((obj) => zodParse(OutputSchema, obj));
}
