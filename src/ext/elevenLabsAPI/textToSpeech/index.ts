import z from "zod";
import { ELEVEN_LABS_API_BASE_URL } from "../constants";
import NoThrow from "@/utils/NoThrow";

// API Request schemas
const VoiceSettingsSchema = z
    .object({
        stability: z.number().min(0).max(1).nullable().optional(),
        similarity_boost: z.number().min(0).max(1).nullable().optional(),
        style: z.number().min(0).max(1).nullable().optional(),
        use_speaker_boost: z.boolean().nullable().optional(),
        speed: z.number().min(0.25).max(4.0).nullable().optional(),
    })
    .optional();

const PronunciationDictionaryLocatorSchema = z.object({
    pronunciation_dictionary_id: z.string(),
    version_id: z.string().nullable().optional(),
});

const OutputFormatSchema = z
    .enum([
        "alaw_8000",
        "mp3_22050_32",
        "mp3_24000_48",
        "mp3_44100_128",
        "mp3_44100_192",
        "mp3_44100_32",
        "mp3_44100_64",
        "mp3_44100_96",
        "opus_48000_128",
        "opus_48000_192",
        "opus_48000_32",
        "opus_48000_64",
        "opus_48000_96",
        "pcm_16000",
        "pcm_22050",
        "pcm_24000",
        "pcm_32000",
        "pcm_44100",
        "pcm_48000",
        "pcm_8000",
        "ulaw_8000",
        "wav_16000",
        "wav_22050",
        "wav_24000",
        "wav_32000",
        "wav_44100",
        "wav_48000",
        "wav_8000",
    ])
    .default("mp3_44100_128");

const ApplyTextNormalizationSchema = z.enum(["auto", "on", "off"]).default("auto");

// Input schema (camelCase)
const TextToSpeechInputSchema = z.object({
    voiceID: z.string(),
    text: z.string(),
    modelID: z.string().default("eleven_multilingual_v2"),
    voiceSettings: VoiceSettingsSchema,
    pronunciationDictionaryLocators: z.array(PronunciationDictionaryLocatorSchema).max(3).nullable().optional(),
    seed: z.number().int().min(0).max(4294967295).nullable().optional(),
    previousText: z.string().nullable().optional(),
    nextText: z.string().nullable().optional(),
    previousRequestIDs: z.array(z.string()).max(3).nullable().optional(),
    nextRequestIDs: z.array(z.string()).max(3).nullable().optional(),
    languageCode: z.string().nullable().optional(),
    // usePVCAsIVC: z.boolean().default(false),
    applyTextNormalization: ApplyTextNormalizationSchema,
    applyLanguageTextNormalization: z.boolean().default(false),
    outputFormat: OutputFormatSchema,
    enableLogging: z.boolean().default(true),
    optimizeStreamingLatency: z.number().int().min(0).max(4).nullable().optional(),
});

// Types
export type VoiceSettings = z.infer<typeof VoiceSettingsSchema>;
export type PronunciationDictionaryLocator = z.infer<typeof PronunciationDictionaryLocatorSchema>;
export type OutputFormat = z.infer<typeof OutputFormatSchema>;
export type ApplyTextNormalization = z.infer<typeof ApplyTextNormalizationSchema>;
export type TextToSpeechInput = z.infer<typeof TextToSpeechInputSchema>;

// Data fetching function
export async function textToSpeech(input: TextToSpeechInput) {
    // Validate input
    const validatedInput = TextToSpeechInputSchema.parse(input);

    // Build URL with query parameters
    const url = new URL(`${ELEVEN_LABS_API_BASE_URL}/text-to-speech/${validatedInput.voiceID}`);
    url.searchParams.append("output_format", validatedInput.outputFormat);
    url.searchParams.append("enable_logging", String(validatedInput.enableLogging));
    if (validatedInput.optimizeStreamingLatency !== undefined && validatedInput.optimizeStreamingLatency !== null) {
        url.searchParams.append("optimize_streaming_latency", String(validatedInput.optimizeStreamingLatency));
    }

    // Build request body (convert camelCase to snake_case)
    const requestBody: Record<string, unknown> = {
        text: validatedInput.text,
        model_id: validatedInput.modelID,
        // use_pvc_as_ivc: validatedInput.usePVCAsIVC,
        use_pvc_as_ivc: false,
        apply_text_normalization: validatedInput.applyTextNormalization,
        apply_language_text_normalization: validatedInput.applyLanguageTextNormalization,
    };

    if (validatedInput.voiceSettings) {
        requestBody.voice_settings = {
            stability: validatedInput.voiceSettings.stability,
            similarity_boost: validatedInput.voiceSettings.similarity_boost,
            style: validatedInput.voiceSettings.style,
            use_speaker_boost: validatedInput.voiceSettings.use_speaker_boost,
            speed: validatedInput.voiceSettings.speed,
        };
    }

    if (validatedInput.languageCode) {
        requestBody.language_code = validatedInput.languageCode;
    }

    if (validatedInput.pronunciationDictionaryLocators) {
        requestBody.pronunciation_dictionary_locators = validatedInput.pronunciationDictionaryLocators.map((loc) => ({
            pronunciation_dictionary_id: loc.pronunciation_dictionary_id,
            version_id: loc.version_id,
        }));
    }

    if (validatedInput.seed !== undefined && validatedInput.seed !== null) {
        requestBody.seed = validatedInput.seed;
    }

    if (validatedInput.previousText) {
        requestBody.previous_text = validatedInput.previousText;
    }

    if (validatedInput.nextText) {
        requestBody.next_text = validatedInput.nextText;
    }

    if (validatedInput.previousRequestIDs) {
        requestBody.previous_request_ids = validatedInput.previousRequestIDs;
    }

    if (validatedInput.nextRequestIDs) {
        requestBody.next_request_ids = validatedInput.nextRequestIDs;
    }

    const response = await fetch(url.toString(), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const errorText = await response.text();
        return NoThrow.err(new Error(`ElevenLabs API error (${response.status}): ${errorText}`));
    }

    // Return the audio data as ArrayBuffer
    return NoThrow.ok(await response.blob());
}
