import z from "zod";
import { InputSchema } from "./input";
import { zodParseAsync } from "@/utils/zodParse";
import { ELEVEN_LABS_INTERNAL_API_BASE_URL } from "../constants";
import { undiciFetch } from "@/utils/undiciFetch";
import { requestHeaders } from "@/requestHeaders";
import { proxyAgentPool } from "@/lib/proxyAgentPool";
import { OutputSchema } from "./output";
import { parseResponseJSON } from "@/utils/parseResponseJSON";

export function subscription(input: z.input<typeof InputSchema>) {
    return zodParseAsync(InputSchema, input).andThen(fn);
}

function fn(inputValidated: z.output<typeof InputSchema>) {
    const url = `${ELEVEN_LABS_INTERNAL_API_BASE_URL}/user/subscription`;

    return undiciFetch(url, {
        headers: {
            ...requestHeaders,
            Authorization: `Bearer ${inputValidated.bearerToken}`,
        },
        dispatcher: proxyAgentPool.get(inputValidated.proxyURL),
    })
        .andThen(parseResponseJSON)
        .andThen((obj) => zodParseAsync(OutputSchema, obj));
}
