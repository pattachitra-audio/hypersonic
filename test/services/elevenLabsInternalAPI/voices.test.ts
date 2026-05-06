import { describe, expect, it, inject } from "vitest";
import { voices } from "@/services/elevenLabsInternalAPI/voices";

describe("voices", async () => {
    it("returns auth account data for a valid bearer token", async () => {
        const firebaseAuth = inject("firebaseAuth");

        const result = await voices({
            proxyURL: firebaseAuth.proxyURL,
            bearerToken: firebaseAuth.idToken,
        });

        if (result.isErr()) {
            throw new Error("Error fetching auth account", { cause: result.error });
        }

        expect(result.isOk()).toBe(true);
    });
});
