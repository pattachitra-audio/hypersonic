import z from "zod";
import { okAsync, ResultAsync } from "neverthrow";
import { zodParseAsync } from "@/utils/zodParse";
import { ElevenLabsRateLimLaneEntry } from "./entry";
import { JSONSerializable } from "@/interfaces/JSONSerializable";
import { JSONDeserializable } from "@/interfaces/JSONDeserializable";
import { Creator } from "@/interfaces/Creator";

export class ElevenLabsRateLimLaneRoster {
    public static Schema = z.object({
        entries: z.array(z.unknown()),
        totalBalance: z.number(),
    });

    private constructor(
        public context: {
            entries: ElevenLabsRateLimLaneEntry[];
            totalBalance: number;
            isTotalBalanceStale: boolean;
        },
    ) {}

    public static serializeToJSON(obj: ElevenLabsRateLimLaneRoster) {
        return ResultAsync.combine(obj.context.entries.map(ElevenLabsRateLimLaneEntry.serializeToJSON)).map(
            (entries) =>
                ({
                    entries,
                    totalBalance: obj.context.totalBalance,
                }) as unknown,
        );
    }

    public static deserializeFromJSON(obj: unknown) {
        return zodParseAsync(ElevenLabsRateLimLaneRoster.Schema, obj)
            .andThen(({ entries, totalBalance }) =>
                ResultAsync.combine(entries.map(ElevenLabsRateLimLaneEntry.deserializeFromJSON)).map((entries) => ({
                    entries,
                    totalBalance,
                })),
            )
            .map((context) => new ElevenLabsRateLimLaneRoster({ ...context, isTotalBalanceStale: false }));
    }

    public static create(entries: ElevenLabsRateLimLaneEntry[]) {
        return ElevenLabsRateLimLaneRoster.computeTotalBalance(entries).map(
            (totalBalance) =>
                new ElevenLabsRateLimLaneRoster({
                    entries,
                    totalBalance,
                    isTotalBalanceStale: false,
                }),
        );
    }

    public get entries() {
        return this.context.entries;
    }

    public static computeTotalBalance(entries: ElevenLabsRateLimLaneEntry[]) {
        return ResultAsync.combine(entries.map((entry) => entry.balance)).map((balances) =>
            balances.reduce((a, b) => a + b, 0),
        );
    }

    public get totalBalance() {
        const self = this;

        if (!self.context.isTotalBalanceStale) {
            return okAsync(self.context.totalBalance);
        }

        return ElevenLabsRateLimLaneRoster.computeTotalBalance(self.context.entries).map((totalBalance) => {
            self.context.totalBalance = totalBalance;
            return totalBalance;
        });
    }
}

ElevenLabsRateLimLaneRoster satisfies JSONSerializable<ElevenLabsRateLimLaneRoster> &
    JSONDeserializable<ElevenLabsRateLimLaneRoster> &
    Creator<ElevenLabsRateLimLaneRoster>;
