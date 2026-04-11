import z from "zod";
import { ResultAsync } from "neverthrow";
import { ElevenLabsCreditLaneEntry } from "./entry";
import { zodParseAsync } from "@/utils/zodParse";

export class ElevenLabsCreditLaneRoster {
    public static Schema = z.object({
        entries: z.array(z.unknown()),
        totalBalance: z.number(),
    });

    private constructor(
        public context: {
            entries: ElevenLabsCreditLaneEntry[];
            totalBalance: number;
        },
    ) {}

    public static serializeToJSON(obj: ElevenLabsCreditLaneRoster) {
        return ResultAsync.combine(obj.context.entries.map(ElevenLabsCreditLaneEntry.serializeToJSON)).map(
            (entries) => ({
                entries,
                totalBalance: obj.context.totalBalance,
            }),
        );
    }

    public static deserializeFromJSON(obj: unknown) {
        return zodParseAsync(ElevenLabsCreditLaneRoster.Schema, obj)
            .andThen(({ entries, totalBalance }) =>
                ResultAsync.combine(entries.map(ElevenLabsCreditLaneEntry.deserializeFromJSON)).map((entries) => ({
                    entries,
                    totalBalance,
                })),
            )
            .map((context) => new ElevenLabsCreditLaneRoster(context));
    }

    public get entries() {
        return this.context.entries;
    }

    public computeTotalBalance() {
        return ResultAsync.combine(this.context.entries.map((entry) => entry.balance)).map((balances) =>
            balances.reduce((a, b) => a + b, 0),
        );
    }

    public get totalBalance() {
        return this.computeTotalBalance();
    }
}
