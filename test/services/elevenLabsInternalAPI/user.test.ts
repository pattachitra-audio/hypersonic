import { describe, expect, it, inject } from "vitest";
import { user } from "@/services/elevenLabsInternalAPI/user";
import { delay } from "test/helpers/delay";

describe("user", async () => {
    await delay(5000);

    it("returns user data for a valid bearer token", async () => {
        const firebaseAuth = inject("firebaseAuth");

        const result = await user({
            proxyURL: firebaseAuth.proxyURL,
            bearerToken: firebaseAuth.idToken,
        });

        if (result.isErr()) {
            throw new Error("Error fetching user", { cause: result.error });
        }

        expect(result.isOk()).toBe(true);
        const userData = result.value;

        expect(userData.email).toBe(firebaseAuth.email);
    });
});
