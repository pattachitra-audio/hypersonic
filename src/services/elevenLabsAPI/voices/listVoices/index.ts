import { ELEVEN_LABS_API_BASE_URL } from "../../constants";
import { ListVoicesRequest, ListVoicesRequestSchema } from "./request";
import { ListVoicesResponseSchema } from "./response";

export async function listVoicesQuery(input: ListVoicesRequest) {
    const {
        nextPageToken,
        pageSize,
        search,
        sortBy,
        sortDirection,
        voiceType,
        category,
        fineTuningState,
        collectionID,
        includeTotalCount,
        voiceIDs,
    } = ListVoicesRequestSchema.parse(input);

    const queryParams = new URLSearchParams();

    if (nextPageToken !== undefined) {
        queryParams.append("next_page_token", nextPageToken);
    }

    if (pageSize !== undefined) {
        queryParams.append("page_size", pageSize.toString());
    }

    if (search !== undefined) {
        queryParams.append("search", search);
    }

    if (sortBy !== undefined) {
        const sortByMap = {
            CREATED_AT_UNIX: "created_at_unix",
            NAME: "name",
        } as const;

        queryParams.append("sort", sortByMap[sortBy]);
    }

    if (sortDirection !== undefined) {
        const sortDirectionMap = {
            ASCENDING: "asc",
            DESCENDING: "desc",
        } as const;

        queryParams.append("sort_direction", sortDirectionMap[sortDirection]);
    }

    if (voiceType) {
        const voiceTypeMap = {
            COMMUNITY: "community",
            DEFAULT: "default",
            NON_DEFAULT: "non-default",
            PERSONAL: "personal",
            WORKSPACE: "workspace",
            SAVED: "saved",
        } as const;

        queryParams.append("voice_type", voiceTypeMap[voiceType]);
    }

    if (category !== undefined) {
        queryParams.append("category", category);
    }

    if (fineTuningState !== undefined) {
        const fineTuningStateMap = {
            DRAFT: "draft",
            NOT_VERIFIED: "not_verified",
            NOT_STARTED: "not_started",
            QUEUED: "queued",
            FINE_TUNING: "fine_tuning",
            FINE_TUNED: "fine_tuned",
            FAILED: "failed",
            DELAYED: "delayed",
        } as const;

        queryParams.append("fine_tuning_state", fineTuningStateMap[fineTuningState]);
    }

    if (collectionID) {
        queryParams.append("collection_id", collectionID);
    }

    if (includeTotalCount !== undefined) {
        queryParams.append("include_total_count", includeTotalCount.toString());
    }

    if (voiceIDs) {
        voiceIDs.forEach((id) => queryParams.append("voice_ids", id));
    }

    const url = `${ELEVEN_LABS_API_BASE_URL}/shared-voices?${queryParams.toString()}`;

    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "XI-API-KEY": "sk_9e9df9c391690586f1d0e5404424aa7cce995b465f1dd4d3",
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        // return NoThrow.err(new Error(`ElevenLabs API error (${response.status}): ${errorText}`));
        throw new Error(`ElevenLabs API error (${response.status}): ${errorText}`);
    }

    let rawData: unknown;

    try {
        rawData = await response.json();
    } catch {
        // return NoThrow.err(new Error(`JSON parse error...`));
        throw new Error(`JSON parse error...`);
    }

    const result = await ListVoicesResponseSchema.safeParseAsync(rawData);

    if (!result.success) {
        // return NoThrow.err(result.error);
        throw result.error;
    }

    // return NoThrow.ok(result.data);
    return result.data;
}
