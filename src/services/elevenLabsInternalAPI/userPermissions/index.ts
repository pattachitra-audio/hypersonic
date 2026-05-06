import z from "zod";
import { InputSchema } from "./input";
import { zodParseAsync } from "@/utils/zodParse";
import { undiciFetch } from "@/utils/undiciFetch";
import { ELEVEN_LABS_INTERNAL_API_BASE_URL } from "../constants";
import { requestHeaders } from "@/requestHeaders";
import { parseResponseJSON } from "@/utils/parseResponseJSON";
import { OutputSchema } from "./output";

export function userPermissions(input: z.input<typeof InputSchema>) {
    return zodParseAsync(InputSchema, input).andThen(fn);
}

function fn(validatedInput: z.output<typeof InputSchema>) {
    const url = `${ELEVEN_LABS_INTERNAL_API_BASE_URL}/workspace/groups/user-permissions`;

    return undiciFetch(url, {
        headers: {
            Authorization: `Bearer ${validatedInput.bearerToken}`,
            ...requestHeaders,
        },
    })
        .andThen(parseResponseJSON)
        .map((obj) => {
            console.log(obj);
            return obj;
        })
        .andThen((obj) => zodParseAsync(OutputSchema, obj));
}
