import { describe, expect, it, inject } from "vitest";
import { models } from "@/services/elevenLabsInternalAPI/models";

describe("voices", async () => {
    it("returns auth account data for a valid bearer token", async () => {
        const firebaseAuth = inject("firebaseAuth");

        const result = await models({
            proxyURL: firebaseAuth.proxyURL,
            bearerToken: firebaseAuth.idToken,
        });

        if (result.isErr()) {
            throw new Error("Error fetching auth account", { cause: result.error });
        }

        expect(result.isOk()).toBe(true);

        const elevenLabsModels = result.value;
        expect(elevenLabsModels.length).toBeGreaterThan(0);

        let s = "Models: [ ";

        elevenLabsModels.forEach((model) => {
            s += `"${model.name}" `;
        });

        s += "]";

        console.log(s);
    });
});
