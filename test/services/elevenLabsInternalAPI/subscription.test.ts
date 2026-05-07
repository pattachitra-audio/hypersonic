import { describe, expect, it, inject } from "vitest";
import { subscription } from "@/services/elevenLabsInternalAPI/subscription";

describe("subscription", async () => {
    it("returns users's subscription", async () => {
        const firebaseAuth = inject("firebaseAuth");

        const result = await subscription({
            proxyURL: firebaseAuth.proxyURL,
            bearerToken: firebaseAuth.idToken,
        });

        if (result.isErr()) {
            throw new Error("Error fetching auth account", { cause: result.error });
        }

        expect(result.isOk()).toBe(true);

        const userSubscription = result.value;
        console.log(`Character count: ${userSubscription.characterCount}, limit: ${userSubscription.characterLimit}`);
    });
});
