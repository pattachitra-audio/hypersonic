import { errAsync, okAsync, ResultAsync } from "neverthrow";
import { ElevenLabsRateLimLaneEntry } from "./entry";
import { ElevenLabsRateLimLaneRoster } from "./roster";

export type ExecuteFunctionType<T, E> = (
    entry: ElevenLabsRateLimLaneEntry,
) => ResultAsync<{ result: T; cost?: number }, E>;

export class ElevenLabsRateLimLaneOrchestrator {
    public static spend<T, E>(roster: ElevenLabsRateLimLaneRoster, amount: number, execute: ExecuteFunctionType<T, E>) {
        const entries = roster.context.entries;

        if (entries.length === 0) {
            return errAsync(new Error(`At least one entry should be present in the roster`));
        }

        return ResultAsync.combine(entries.map((entry) => entry.balance.map((balance) => ({ entry, balance }))))
            .map((entriesWithBalance) => entriesWithBalance.sort((a, b) => a.balance - b.balance))
            .andThen((ascendingSortedEntries) => {
                if (ascendingSortedEntries.at(-1)!.balance < amount) {
                    return errAsync(new Error(`No entry with balance >= ${amount} exists`));
                }

                return okAsync(ascendingSortedEntries.at(-1)!.entry);
            })
            .andThen((entry) =>
                execute(entry)
                    .andThen(({ result, cost }) =>
                        entry.decrementBalance(cost == null ? amount : cost).map(() => result),
                    )
                    .mapErr((error) => (entry.invalidateBalance(), error)),
            );
    }

    public static spendOn<T, E>(
        roster: ElevenLabsRateLimLaneRoster,
        resourceID: string,
        amount: number,
        execute: ExecuteFunctionType<T, E>,
    ) {
        const entry = roster.entries.find((entry) => entry.resource.id === resourceID);

        if (entry === undefined) {
            return errAsync(new Error(`No resource with id '${resourceID}'`));
        }

        entry.balance
            .andThen((balance) => {
                if (balance < amount) {
                    return errAsync(
                        new Error(
                            `Not enough balance for resource '${resourceID}'; (Balance: ${balance}, Requested: ${amount})`,
                        ),
                    );
                }

                return okAsync();
            })
            .andThen(() => execute(entry).mapErr((error) => (entry.invalidateBalance(), error)));
    }
}
