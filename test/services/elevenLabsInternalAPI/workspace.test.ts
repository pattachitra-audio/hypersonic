import { describe, expect, it, inject } from "vitest";
import { workspace } from "@/services/elevenLabsInternalAPI/workspace";
import { delay } from "test/helpers/delay";

describe("workspace", async () => {
    await delay(5000);

    it("returns workspace data for a valid bearer token", async () => {
        const firebaseAuth = inject("firebaseAuth");

        const result = await workspace({
            proxyURL: firebaseAuth.proxyURL,
            bearerToken: firebaseAuth.idToken,
        });

        if (result.isErr()) {
            throw new Error("Error fetching workspace", { cause: result.error });
        }

        expect(result.isOk()).toBe(true);

        const data = result.value;

        expect(typeof data.workspaceID).toBe("string");
        expect(typeof data.name).toBe("string");
        expect(typeof data.ownerID).toBe("string");
        expect(typeof data.subscription).toBe("object");
    });
});
