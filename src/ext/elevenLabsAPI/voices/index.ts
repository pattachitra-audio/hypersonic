import { ELEVEN_LABS_API_BASE_URL } from "../constants";
import NoThrow from "@/utils/NoThrow";
import { ListVoicesInput } from "./listVoices/input";
import { ListVoicesResponseSchema } from "./listVoices/response";

export async function listVoices(input: ListVoicesInput) {
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
        includeTotalCount = true,
        voiceIDs,
    } = input;

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

    const url = `${ELEVEN_LABS_API_BASE_URL}/voices?${queryParams.toString()}`;

    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        return NoThrow.err(new Error(`ElevenLabs API error (${response.status}): ${errorText}`));
    }

    let rawData: unknown;

    try {
        rawData = await response.json();
    } catch {
        return NoThrow.err(new Error(`JSON parse error...`));
    }

    const result = await ListVoicesResponseSchema.safeParseAsync(rawData);

    if (!result.success) {
        return NoThrow.err(result.error);
    }

    return NoThrow.ok(result.data);
}
