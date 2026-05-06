import z from "zod";
import { undiciFetch } from "@/utils/undiciFetch";
import { ELEVEN_LABS_INTERNAL_API_BASE_URL } from "../constants";
import { requestHeaders } from "@/requestHeaders";
import { parseResponseJSON } from "@/utils/parseResponseJSON";
import { zodParseAsync } from "@/utils/zodParse";
import { OutputSchema } from "./output";
import { InputSchema } from "./input";
import { proxyAgentPool } from "@/lib/proxyAgentPool";

export function voices(input: z.input<typeof InputSchema>) {
    return zodParseAsync(InputSchema, input).andThen(fn);
}

function fn(validatedInput: z.output<typeof InputSchema>) {
    const url = `${ELEVEN_LABS_INTERNAL_API_BASE_URL}/voices?show_legacy=true`;

    return undiciFetch(url, {
        headers: {
            ...requestHeaders,
            Authorization: `Bearer ${validatedInput.bearerToken}`,
        },
        dispatcher: proxyAgentPool.get(validatedInput.proxyURL),
    })
        .andThen(parseResponseJSON)
        .andThen((obj) => zodParseAsync(OutputSchema, obj));
}
