import { describe, expect, it, inject } from "vitest";
import { history } from "@/services/elevenLabsInternalAPI/history";
import { delay } from "test/helpers/delay";

describe("history", async () => {
    await delay(5000);

    it("returns history data for a valid bearer token", async () => {
        const firebaseAuth = inject("firebaseAuth");

        const historyResult = await history({
            proxyURL: firebaseAuth.proxyURL,
            bearerToken: firebaseAuth.idToken,
        });

        if (historyResult.isErr()) {
            throw new Error("Error fetching history", { cause: historyResult.error });
        }

        expect(historyResult.isOk()).toBe(true);

        const historyData = historyResult.value;

        expect(Array.isArray(historyData.history)).toBe(true);
        expect(typeof historyData.more).toBe("boolean");
    });
});
