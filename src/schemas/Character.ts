import z from "zod";

const ZeroToOneSchema = z.number().min(0).max(1);
const AutoOnOffSchema = z.enum(["auto", "on", "off"]);

export const ElevenLabsTextToSpeechVoiceSettingsSchema = z.object({
    stability: ZeroToOneSchema.default(0.5),
    speakerBoost: z.boolean().default(true),
    similarityBoost: ZeroToOneSchema.default(0.75),
    style: z.number().default(1),
    speed: z.number().default(1),
    applyTextNormalization: AutoOnOffSchema.default("auto"),
    applyLanguageTextNormalization: z.boolean().default(false),
});

export const ElevenLabsTextToSpeechVoiceSettingsDefaultValue = ElevenLabsTextToSpeechVoiceSettingsSchema.parse({});

export type ElevenLabsTextToSpeechVoiceSettings = z.infer<typeof ElevenLabsTextToSpeechVoiceSettingsSchema>;

const ElevenLabsVoiceProviderSchema = z.object({
    provider: z.literal("ELEVENLABS").describe("Voice provider identifier for ElevenLabs"),
    voiceID: z.string().describe("Unique voice identifier from ElevenLabs voice library"),
    name: z.string().nullable(),
    gender: z.enum(["male", "female"]),
    category: z.enum(["generated", "cloned", "premade", "professional", "famous", "high_quality"]),
    description: z.string().nullable(),
    verifiedLanguages: z
        .array(
            z.object({
                language: z.string(),
                modelID: z.string(),
                accent: z.string().nullable(),
                locale: z.string().nullable(),
            }),
        )
        .nullable(),
    voiceSettings: z
        .object({
            textToSpeech: ElevenLabsTextToSpeechVoiceSettingsSchema.optional(),
            textToDialogue: z
                .object({
                    stability: ZeroToOneSchema.optional(),
                    seed: z.number().min(0).max(4294967295).optional(),
                    textNormalization: AutoOnOffSchema.optional(),
                })
                .optional(),
        })
        .optional(),
});
/*
const HeyGenVoiceProviderSchema = z.object({
    provider: z.literal("HEYGEN").describe("Voice provider identifier for HeyGen"),
    voiceID: z.string().describe("Unique voice identifier from HeyGen voice library"),
});
*/

export const CharacterSchema = z.object({
    name: z.string().max(64).describe("Character's name (maximum 64 characters)"),
    gender: z.enum(["male", "female"]),
    ageGroup: z
        .tuple([z.number().min(6), z.number().max(96)])
        .describe("Character's age range as [minimum age, maximum age], where min is at least 6 and max is at most 96"),
    description: z
        .string()
        .describe("Detailed description of the character's appearance, personality, and role in the story"),
    voiceDescription: z
        .string()
        .describe("Description of the character's voice characteristics (tone, accent, pitch, speaking style, etc.)"),
    voice: z
        .discriminatedUnion("provider", [ElevenLabsVoiceProviderSchema])
        .optional()
        .describe("Optional voice configuration from either ElevenLabs or HeyGen provider"),
});

export type Character = z.infer<typeof CharacterSchema>;
export type CharacterVoice = NonNullable<Character["voice"]>;
export type CharacterVoiceSettings = NonNullable<CharacterVoice["voiceSettings"]>;

export type TextToSpeechCharacterVoiceSettings = NonNullable<CharacterVoiceSettings["textToSpeech"]>;
