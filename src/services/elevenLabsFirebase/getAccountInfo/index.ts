import z from "zod";
import { InputSchema } from "./input";
import { undiciFetch } from "@/utils/undiciFetch";
import { ELEVEN_LABS_FIREBASE_API_KEY, FIREBASE_BASE_URL } from "../constants";
import { requestHeaders } from "@/requestHeaders";
import { parseResponseJSON } from "@/utils/parseResponseJSON";
import { OutputSchema } from "./output";
import { zodParse, zodParseAsync } from "@/utils/zodParse";

export function getAccountInfo(input: z.input<typeof InputSchema>) {
    return zodParseAsync(InputSchema, input).andThen(fn);
}

function fn(validatedInput: z.output<typeof InputSchema>) {
    const url = `${FIREBASE_BASE_URL}/v1/accounts:lookup?key=${ELEVEN_LABS_FIREBASE_API_KEY}`;

    return undiciFetch(url, {
        method: "POST",
        body: JSON.stringify({ idToken: validatedInput.idToken }),
        headers: {
            "Content-Type": "application/json",
            ...requestHeaders,
        },
    })
        .andThen(parseResponseJSON)
        .andThen((obj) => zodParse(OutputSchema, obj));
}
