import { describe, expect, it, inject } from "vitest";
import { enhanceDialogue } from "@/services/elevenLabsInternalAPI/enhanceDialogue";
import { delay } from "test/helpers/delay";

describe("enhanceDialogue", async () => {
    await delay(5000);

    it("returns enhanced dialogue blocks", async () => {
        const firebaseAuth = inject("firebaseAuth");

        const dialogueBlocks = [
            "নির্মল গোপাল বাবুর বিধ্বস্ত চেহারা দেখে চমকে উঠলেন, তাঁর গলায় উৎকণ্ঠা আর সহানুভূতির সুর ফুটে উঠল।",
            "গোপাল বাবু? আপনি উঠেছেন? শরীর কেমন এখন?",
            "গোপাল বাবু শূন্য দৃষ্টিতে তাকালেন, যেন তাঁর আত্মা শরীর ছেড়ে বেরিয়ে গেছে, কণ্ঠস্বর প্রাণহীন।",
        ];

        const result = await enhanceDialogue({
            proxyURL: firebaseAuth.proxyURL,
            bearerToken: firebaseAuth.idToken,
            dialogueBlocks,
        });

        if (result.isErr()) {
            throw new Error("Error enhancing dialogue", { cause: result.error });
        }

        expect(result.isOk()).toBe(true);
        expect(result.value.enhanced).toBe(true);
        expect(result.value.enhancedBlocks).toHaveLength(dialogueBlocks.length);

        for (let i = 0; i < dialogueBlocks.length; i++) {
            const dialogueBlock = dialogueBlocks[i];
            const enhancedBlock = result.value.enhancedBlocks[i];
            expect(enhancedBlock).toContain(dialogueBlock);
        }
    });
});
