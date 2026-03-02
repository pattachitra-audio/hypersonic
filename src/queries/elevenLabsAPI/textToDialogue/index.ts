import z from "zod";
import { ELEVEN_LABS_API_BASE_URL } from "../constants";

// Zod schemas (keeping these for validation)
const AllowedOutputFormatsSchema = z.enum([
    "mp3_22050_32",
    "mp3_24000_48",
    "mp3_44100_32",
    "mp3_44100_64",
    "mp3_44100_96",
    "mp3_44100_128",
    "mp3_44100_192",
    "pcm_8000",
    "pcm_16000",
    "pcm_22050",
    "pcm_24000",
    "pcm_32000",
    "pcm_44100",
    "pcm_48000",
    "ulaw_8000",
    "alaw_8000",
    "opus_48000_32",
    "opus_48000_64",
    "opus_48000_96",
    "opus_48000_128",
    "opus_48000_192",
]);

const DialogueInputSchema = z.object({
    text: z.string(),
    voiceID: z.string(),
});

const ModelSettingsSchema = z.object({
    stability: z.number().nullable().optional().default(0.5),
});

const PronunciationDictionaryLocatorSchema = z.object({
    pronunciationDictionaryID: z.string(),
    versionID: z.string().nullable().optional(),
});

const ApplyTextNormalizationSchema = z.enum(["auto", "on", "off"]).default("auto");

const TextToDialogueOutputSchema = z.object({
    audio: z.string(), // base64 encoded audio
    contentType: z.string(),
});

// Types
export type DialogueInput = z.infer<typeof DialogueInputSchema>;
export type ModelSettings = z.infer<typeof ModelSettingsSchema>;
export type PronunciationDictionaryLocator = z.infer<typeof PronunciationDictionaryLocatorSchema>;
export type AllowedOutputFormats = z.infer<typeof AllowedOutputFormatsSchema>;
export type ApplyTextNormalization = z.infer<typeof ApplyTextNormalizationSchema>;
export type TextToDialogueOutput = z.infer<typeof TextToDialogueOutputSchema>;

export interface TextToDialogueParams {
    inputs: DialogueInput[];
    modelID?: string;
    languageCode?: string | null;
    settings?: ModelSettings | null;
    pronunciationDictionaryLocators?: PronunciationDictionaryLocator[] | null;
    seed?: number | null;
    applyTextNormalization?: ApplyTextNormalization;
    outputFormat?: AllowedOutputFormats;
}

// Data fetching function
export async function textToDialogue(params: TextToDialogueParams): Promise<TextToDialogueOutput> {
    const {
        inputs,
        modelID = "eleven_v3",
        languageCode,
        settings,
        pronunciationDictionaryLocators,
        seed,
        applyTextNormalization,
        outputFormat,
    } = params;

    // Build query params
    const queryParams = new URLSearchParams();
    if (outputFormat) {
        queryParams.append("output_format", outputFormat);
    }

    const url = `${ELEVEN_LABS_API_BASE_URL}/text-to-dialogue${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

    // Transform camelCase to snake_case for API
    const requestBody = {
        inputs: inputs.map((item) => ({
            text: item.text,
            voice_id: item.voiceID,
        })),
        model_id: modelID,
        language_code: languageCode,
        settings: settings,
        pronunciation_dictionary_locators: pronunciationDictionaryLocators?.map((locator) => ({
            pronunciation_dictionary_id: locator.pronunciationDictionaryID,
            version_id: locator.versionID,
        })),
        seed: seed,
        apply_text_normalization: applyTextNormalization,
    };

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ElevenLabs API error (${response.status}): ${errorText}`);
    }

    // Get and validate the array buffer
    const arrayBuffer = await response.arrayBuffer();

    // Validate content type
    const contentType = response.headers.get("content-type") || "application/octet-stream";

    // Validate that we actually received audio data
    if (arrayBuffer.byteLength === 0) {
        throw new Error("Received empty audio response from ElevenLabs API");
    }

    // Convert audio to base64
    const uint8Array = new Uint8Array(arrayBuffer);
    const base64 = btoa(String.fromCharCode(...uint8Array));

    // Validate base64 string
    if (!base64 || base64.length === 0) {
        throw new Error("Failed to convert audio to base64");
    }

    const result = {
        audio: base64,
        contentType,
    };

    // Validate output with Zod
    return TextToDialogueOutputSchema.parse(result);
}
