import { fetch as undiciFetch, Response } from "undici";
import z from "zod";
import { ELEVEN_LABS_INTERNAL_API_BASE_URL } from "../constants";
import { RequestSchema, RequestType } from "./request";
import { NoThrow } from "@/utils/NoThrow";
import { proxyAgentPool } from "@/lib/proxyAgentPool";
import { requestHeaders } from "@/requestHeaders";
import { ResponseSchema } from "./response";

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
    const inputValidationResult = await RequestSchema.safeDecodeAsync(input);

    if (!inputValidationResult.success) {
        return NoThrow.error(inputValidationResult.error);
    }

    const validatedInput = inputValidationResult.data;

    const url = `${ELEVEN_LABS_INTERNAL_API_BASE_URL}/history`;
    let response: Response;

    const queryParams = prepareQueryParams(validatedInput);

    try {
        response = await undiciFetch(`${url}?${queryParams.toString()}`, {
            headers: {
                ...requestHeaders,
                "Cache-Control": "no-cache",
                Authorization: `Bearer ${validatedInput.bearerToken}`,
            },
            dispatcher: proxyAgentPool.get(validatedInput.proxyURL),
        });
    } catch (error) {
        return NoThrow.error(error);
    }

    let rawData: unknown;

    try {
        rawData = await response.json();
    } catch (error) {
        return NoThrow.error(error);
    }

    return NoThrow.fromZodResultType(await ResponseSchema.safeParseAsync(rawData));
}
