import z from "zod";
import { ResultAsync } from "neverthrow";
import { zodParseAsync } from "@/utils/zodParse";
import { ElevenLabsFreeLaneEntry } from "./entry";

export class ElevenLabsFreeLaneRoster {
    public static Schema = z.object({
        entries: z.array(z.unknown()),
        totalBalance: z.number(),
    });

    private constructor(
        public context: {
            entries: ElevenLabsFreeLaneEntry[];
            totalBalance: number;
        },
    ) {}

    public static serializeToJSON(obj: ElevenLabsFreeLaneRoster) {
        return ResultAsync.combine(obj.context.entries.map(ElevenLabsFreeLaneEntry.serializeToJSON)).map((entries) => ({
            entries,
            totalBalance: obj.context.totalBalance,
        }));
    }

    public static deserializeFromJSON(obj: unknown) {
        return zodParseAsync(ElevenLabsFreeLaneRoster.Schema, obj)
            .andThen(({ entries, totalBalance }) =>
                ResultAsync.combine(entries.map(ElevenLabsFreeLaneEntry.deserializeFromJSON)).map((entries) => ({
                    entries,
                    totalBalance,
                })),
            )
            .map((context) => new ElevenLabsFreeLaneRoster(context));
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
