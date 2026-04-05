import { RedisClientResultAsync } from "@/lib/RedisClient";
import { parseJSONArray } from "@/utils/parseJSON";
import { ElevenLabsCreditsResource } from "@/utils/prao/ElevenLabsCredits/resource";
import { ObjectId } from "mongodb";
import { ok, Result } from "neverthrow";

export const ElevenLabsCreditsSessionRepositoryResultAsync = RedisClientResultAsync.andThen((RedisClient) => {
    return ok({
        set(sessionID: ObjectId, resources: ElevenLabsCreditsResource[]) {
            return Result.combine(resources.map(ElevenLabsCreditsResource.serializeToJSON))
                .map(JSON.stringify)
                .asyncAndThen((s) => RedisClient.set(`ElevenLabsCreditsSession@${sessionID}`, s));
        },

        get(sessionID: ObjectId) {
            return RedisClient.get(`ElevenLabsCreditsSession@${sessionID}`)
                .andThen(parseJSONArray)
                .andThen((resources) => Result.combine(resources.map(ElevenLabsCreditsResource.deserializeFromJSON)));
        },
    });
});
