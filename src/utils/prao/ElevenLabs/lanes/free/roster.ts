import z from "zod";
import { okAsync, ResultAsync } from "neverthrow";
import { zodParseAsync } from "@/utils/zodParse";
import { ElevenLabsFreeLaneEntry } from "./entry";
import { JSONSerializable } from "@/interfaces/JSONSerializable";
import { JSONDeserializable } from "@/interfaces/JSONDeserializable";
import { Creator } from "@/interfaces/Creator";

export class ElevenLabsFreeLaneRoster {
    public static Schema = z.object({
        entries: z.array(z.unknown()),
        totalBalance: z.number(),
    });

    private constructor(
        public context: {
            entries: ElevenLabsFreeLaneEntry[];
            totalBalance: number;
            isTotalBalanceStale: boolean;
        },
    ) {}

    public static serializeToJSON(obj: ElevenLabsFreeLaneRoster) {
        return ResultAsync.combine(obj.context.entries.map(ElevenLabsFreeLaneEntry.serializeToJSON)).map(
            (entries) =>
                ({
                    entries,
                    totalBalance: obj.context.totalBalance,
                }) as unknown,
        );
    }

    public static deserializeFromJSON(obj: unknown) {
        return zodParseAsync(ElevenLabsFreeLaneRoster.Schema, obj)
            .andThen(({ entries, totalBalance }) =>
                ResultAsync.combine(entries.map(ElevenLabsFreeLaneEntry.deserializeFromJSON)).map((entries) => ({
                    entries,
                    totalBalance,
                })),
            )
            .map((context) => new ElevenLabsFreeLaneRoster({ ...context, isTotalBalanceStale: false }));
    }

    public static create(entries: ElevenLabsFreeLaneEntry[]) {
        return ElevenLabsFreeLaneRoster.computeTotalBalance(entries).map(
            (totalBalance) =>
                new ElevenLabsFreeLaneRoster({
                    entries,
                    totalBalance,
                    isTotalBalanceStale: false,
                }),
        );
    }

    public get entries() {
        return this.context.entries;
    }

    public static computeTotalBalance(entries: ElevenLabsFreeLaneEntry[]) {
        return ResultAsync.combine(entries.map((entry) => entry.balance)).map((balances) =>
            balances.reduce((a, b) => a + b, 0),
        );
    }

    public get totalBalance() {
        const self = this;

        if (!self.context.isTotalBalanceStale) {
            return okAsync(self.context.totalBalance);
        }

        return ElevenLabsFreeLaneRoster.computeTotalBalance(self.context.entries).map((totalBalance) => {
            self.context.totalBalance = totalBalance;
            return totalBalance;
        });
    }
}

ElevenLabsFreeLaneRoster satisfies JSONSerializable<ElevenLabsFreeLaneRoster> &
    JSONDeserializable<ElevenLabsFreeLaneRoster> &
    Creator<ElevenLabsFreeLaneRoster>;
