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

        const elevenLabsVoices = result.value;
        expect(elevenLabsVoices.length).toBeGreaterThan(0);

        let s = "Top voices: [\n";

        for (let i = 0; i < Math.min(elevenLabsVoices.length, 5); i++) {
            s += `    Name: ${elevenLabsVoices[i].name}; ID: ${elevenLabsVoices[i].voiceId}\n`;
        }

        s += "]\n";

        console.log(s);
    });
});
