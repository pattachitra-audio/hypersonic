import { describe, expect, it, inject } from "vitest";
import { authAccount } from "@/services/elevenLabsInternalAPI/authAccount";
import { delay } from "test/helpers/delay";

describe("authAccount", async () => {
    await delay(5000);

    it("returns account data", async () => {
        const firebaseAuth = inject("firebaseAuth");

        const result = await authAccount({
            proxyURL: firebaseAuth.proxyURL,
            bearerToken: firebaseAuth.idToken,
        });

        if (result.isErr()) {
            throw new Error("Error fetching auth account", { cause: result.error });
        }

        expect(result.isOk()).toBe(true);
        expect(result.value.email).toBe(firebaseAuth.email);
    });
});
