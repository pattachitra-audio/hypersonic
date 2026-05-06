import { describe, expect, it, inject } from "vitest";
import { textToDialogue } from "@/services/elevenLabsInternalAPI/textToDialogue";
import { delay } from "test/helpers/delay";
import CodecParser, { CodecFrame } from "codec-parser";

describe("textToDialogue", async () => {
    await delay(5000);

    it("returns an audio buffer", async () => {
        const firebaseAuth = inject("firebaseAuth");

        const result = await textToDialogue({
            proxyURL: firebaseAuth.proxyURL,
            bearerToken: firebaseAuth.idToken,
            inputs: [
                {
                    text: "[surprised] নির্মল গোপাল বাবুর বিধ্বস্ত চেহারা দেখে চমকে উঠলেন, তাঁর গলায় উৎকণ্ঠা আর সহানুভূতির সুর ফুটে উঠল।",
                    voiceID: "PleK417YVMP2SUWm8Btb",
                },
            ],
            modelID: "eleven_v3_dpo",
            languageCode: "bn",
            settings: {
                stability: 0.5,
            },
            outputFormat: "MP3_44100_128",
        });

        if (result.isErr()) {
            throw new Error("Error generating audio", { cause: result.error });
        }

        expect(result.isOk()).toBe(true);
        expect(result.value.buffer.byteLength).toBeGreaterThan(0);

        const parser = new CodecParser<CodecFrame>("audio/mpeg");
        const frames = parser.parseAll(new Uint8Array(result.value.buffer));

        console.log("numFrames:", frames.length);

        for (const frame of frames) {
            const header = frame.header;
            expect(header.sampleRate).toBe(44100);
            expect(header.channels).toBe(1);
            expect(header.bitrate).toBe(128);
            expect(header.bitDepth).toBe(16);
        }
    });
});
