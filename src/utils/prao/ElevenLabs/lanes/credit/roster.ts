import z from "zod";
import { okAsync, ResultAsync } from "neverthrow";
import { ElevenLabsCreditLaneEntry } from "./entry";
import { zodParseAsync } from "@/utils/zodParse";
import { JSONSerializable } from "@/interfaces/JSONSerializable";
import { JSONDeserializable } from "@/interfaces/JSONDeserializable";
import { Creator } from "@/interfaces/Creator";

export class ElevenLabsCreditLaneRoster {
    public static Schema = z.object({
        entries: z.array(z.unknown()),
        totalBalance: z.number(),
    });

    private constructor(
        public context: {
            entries: ElevenLabsCreditLaneEntry[];
            totalBalance: number;
            isTotalBalanceStale: boolean;
        },
    ) {}

    public static serializeToJSON(obj: ElevenLabsCreditLaneRoster) {
        return ResultAsync.combine(obj.context.entries.map(ElevenLabsCreditLaneEntry.serializeToJSON)).map(
            (entries) =>
                ({
                    entries,
                    totalBalance: obj.context.totalBalance,
                }) as unknown,
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
            .map((context) => new ElevenLabsCreditLaneRoster({ ...context, isTotalBalanceStale: false }));
    }

    public static create(entries: ElevenLabsCreditLaneEntry[]) {
        return ElevenLabsCreditLaneRoster.computeTotalBalance(entries).map(
            (totalBalance) => new ElevenLabsCreditLaneRoster({ entries, totalBalance, isTotalBalanceStale: false }),
        );
    }

    public get entries() {
        return this.context.entries;
    }

    public static computeTotalBalance(entries: ElevenLabsCreditLaneEntry[]) {
        return ResultAsync.combine(entries.map((entry) => entry.balance)).map((balances) =>
            balances.reduce((a, b) => a + b, 0),
        );
    }

    public get totalBalance() {
        const self = this;

        if (!self.context.isTotalBalanceStale) {
            return okAsync(self.context.totalBalance);
        }

        return ElevenLabsCreditLaneRoster.computeTotalBalance(self.context.entries).map((totalBalance) => {
            self.context.totalBalance = totalBalance;
            return totalBalance;
        });
    }
}

ElevenLabsCreditLaneRoster satisfies JSONSerializable<ElevenLabsCreditLaneRoster> &
    JSONDeserializable<ElevenLabsCreditLaneRoster> &
    Creator<ElevenLabsCreditLaneRoster>;
