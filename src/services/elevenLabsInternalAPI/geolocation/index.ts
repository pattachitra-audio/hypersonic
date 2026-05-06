import z from "zod";
import { InputSchema } from "./input";
import { zodParseAsync } from "@/utils/zodParse";
import { undiciFetch } from "@/utils/undiciFetch";
import { requestHeaders } from "@/requestHeaders";
import { proxyAgentPool } from "@/lib/proxyAgentPool";
import { parseResponseJSON } from "@/utils/parseResponseJSON";
import { OutputSchema } from "./output";

export function geolocation(input: z.input<typeof InputSchema>) {
    return zodParseAsync(InputSchema, input).andThen(fn);
}

function fn(validatedInput: z.output<typeof InputSchema>) {
    const url = `https://us-central1-xi-labs.cloudfunctions.net/geolocation`;

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
