import z from "zod";
import { ELEVEN_LABS_INTERNAL_API_BASE_URL } from "../constants";
import { RequestSchema, RequestType } from "./request";
import { proxyAgentPool } from "@/lib/proxyAgentPool";
import { requestHeaders } from "@/requestHeaders";
import { ResponseSchema } from "./response";
import { zodParse } from "@/utils/zodParse";
import { parseResponseJSON } from "@/utils/parseResponseJSON";
import { undiciFetch } from "@/utils/undiciFetch";

function prepareQueryParams(validatedInput: z.output<typeof RequestSchema>) {
    const queryParams = new URLSearchParams();
    queryParams.append("page_size", validatedInput.pageSize.toString());

    if (validatedInput.filters) {
        const filters = validatedInput.filters;

        const optionalFilters: Record<string, string | number | undefined> = {
            start_after_history_item_id: filters.startAfterHistoryItemID,
            date_before_unix: filters.dateBeforeUnix,
            date_after_unix: filters.dateAfterUnix,
            sort_direction: filters.sortDirection,
            search: filters.search,
            source: filters.source,
        };

        for (const [key, value] of Object.entries(optionalFilters)) {
            if (value !== undefined) {
                queryParams.append(key, value.toString());
            }
        }
    }

    return queryParams;
}

export async function history(input: RequestType) {
    return zodParse(RequestSchema, input)
        .asyncAndThen((validatedInput) => {
            const url = `${ELEVEN_LABS_INTERNAL_API_BASE_URL}/history`;
            const queryParams = prepareQueryParams(validatedInput);

            return undiciFetch(`${url}?${queryParams.toString()}`, {
                headers: {
                    ...requestHeaders,
                    "Cache-Control": "no-cache",
                    Authorization: `Bearer ${validatedInput.bearerToken}`,
                },
                dispatcher: proxyAgentPool.get(validatedInput.proxyURL),
            });
        })
        .andThen((response) => parseResponseJSON(response))
        .andThen((obj) => zodParse(ResponseSchema, obj));
}
