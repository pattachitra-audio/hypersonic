import { elevenLabsRouter } from "@/ext/elevenLabsAPI";
import NoThrow, { Result, ResultAsync } from "@/utils/NoThrow";
import z from "zod";

const KeyStoreSchema = z.array(
    z.object({
        apiKey: z.string(),
        usageCount: z.number(),
    }),
);

// TODO: Finish this class
class ElevenLabsAPIKeyStore {
    static KEY = "apiKeys";
    keys: Map<string, { credits: { total: number; remaining: number } }>;

    constructor() {
        this.keys = new Map();
    }

    async init() {
        const storedKeys = localStorage.getItem(ElevenLabsAPIKeyStore.KEY);

        if (storedKeys === null) {
            return NoThrow.ok();
        }

        let parsed: unknown;

        try {
            parsed = JSON.parse(storedKeys);
        } catch {
            console.error("Failed to parse API keys from local storage");
            localStorage.removeItem(ElevenLabsAPIKeyStore.KEY);
            return NoThrow.ok();
        }

        const result = await KeyStoreSchema.safeParseAsync(parsed);

        if (!result.success) {
            localStorage.removeItem(ElevenLabsAPIKeyStore.KEY);
            console.error("Failed to validate API keys from local storage");
            return NoThrow.ok();
        }

        const apiKeys = result.data;

        apiKeys.forEach((apiKey) => {
            // elevenLabsRouter.
        });

        return NoThrow.ok();
    }

    async addAPIKey(apiKey: string) {
        if (this.keys.has(apiKey)) {
            return NoThrow.err(new Error("API key is already present"));
        }

        this.keys.set(apiKey);

        return NoThrow.ok();
    }

    removeAPIKey(apiKey: string) {
        if (!this.keys.has(apiKey)) {
            return NoThrow.err(new Error("API key not found"));
        }

        this.keys.delete(apiKey);
    }

    getAllAPIKeys() {}

    getRandomAPIKey(): string {
        return "";
    }
}

const elevenLabsAPIKeyStore = new ElevenLabsAPIKeyStore();

export async function getAPIKeyStore() {
    return await elevenLabsAPIKeyStore.init();
}
