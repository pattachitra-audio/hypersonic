import z from "zod";
import { zodParse } from "@/utils/zodParse";
import { InputSchema } from "./input";
import { ELEVEN_LABS_INTERNAL_API_BASE_URL } from "../constants";
import { ok } from "neverthrow";
import { undiciFetch } from "@/utils/undiciFetch";
import { safeUnwrap } from "@/utils/safeUnwrap";
import { requestHeaders } from "@/requestHeaders";
import { proxyAgentPool } from "@/lib/proxyAgentPool";
import { parseResponseJSON } from "@/utils/parseResponseJSON";
import { OutputSchema } from "./output";

function buildQueryParams(validatedInput: z.output<typeof InputSchema>) {
    const queryParams = new URLSearchParams();

    if (validatedInput.searchQuery != null) {
        queryParams.append("search", validatedInput.searchQuery);
    }

    queryParams.append("sort", validatedInput.sort);

    queryParams.append("page_size", validatedInput.pageSize.toString());
    queryParams.append("page", validatedInput.pageNum.toString());

    return ok(queryParams);
}

export function sharedVoices(input: z.input<typeof InputSchema>) {
    return zodParse(InputSchema, input).asyncAndThen((validatedInput) => {
        const url = `${ELEVEN_LABS_INTERNAL_API_BASE_URL}/shared-voices`;
        const queryParams = safeUnwrap(buildQueryParams(validatedInput));

        return undiciFetch(`${url}?${queryParams.toString()}`, {
            headers: {
                ...requestHeaders,
                authorization: `Bearer ${validatedInput.bearerToken}`,
            },
            dispatcher: proxyAgentPool.get(validatedInput.proxyURL),
        })
            .andThen(parseResponseJSON)
            .andThen((obj) => zodParse(OutputSchema, obj));
    });
}
