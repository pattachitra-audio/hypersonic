import { describe, expect, it, inject } from "vitest";
import { history } from "@/services/elevenLabsInternalAPI/history";
import { delay } from "test/helpers/delay";

describe("history", async () => {
    await delay(5000);

    it("returns history data for a valid bearer token", async () => {
        const firebaseAuth = inject("firebaseAuth");

        const result = await history({
            proxyURL: firebaseAuth.proxyURL,
            bearerToken: firebaseAuth.idToken,
        });

        if (result.isErr()) {
            throw new Error("Error fetching history", { cause: result.error });
        }

        expect(result.isOk()).toBe(true);

        const data = result.value;

        expect(Array.isArray(data.history)).toBe(true);
        expect(typeof data.lastHistoryItemID).toBe("string");
        expect(typeof data.hasMore).toBe("boolean");
        expect(typeof data.scannedUntil).toBe("number");
    });
});
