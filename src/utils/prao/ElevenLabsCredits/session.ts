import z from "zod";

import { ok, Result, ResultAsync } from "neverthrow";
import { zodParse } from "@/utils/zodParse";
import { ElevenLabsCreditsResource } from "./resource";

export class ElevenLabsCreditsSession {
    constructor(public context: { resources: ElevenLabsCreditsResource[]; totalBalance: number }) {}

    static new(resources: ElevenLabsCreditsResource[]) {
        ResultAsync.combine(resources.map((value) => value.getBalance()))
            .andThen((balances) => ok(balances.reduce((a, b) => a + b, 0)))
            .map((totalBalance) => new ElevenLabsCreditsSession({ resources, totalBalance }));
    }

    static serializeToJSON(obj: ElevenLabsCreditsSession) {
        return ok({
            totalBalance: obj,
            resources: obj.context.resources,
        });
    }

    static deserializeFromJSON(obj: unknown) {
        const schema = z.object({
            totalBalance: z.int(),
            resources: z.array(z.unknown()),
        });

        return zodParse(schema, obj)
            .andThen(({ resources, ...rest }) => {
                return Result.combine(resources.map(ElevenLabsCreditsResource.deserializeFromJSON)).map(
                    (resources) => ({
                        resources,
                        ...rest,
                    }),
                );
            })
            .map((obj) => new ElevenLabsCreditsSession(obj));
    }
}
