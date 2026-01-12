import z from "zod";

const ElevenLabsVoiceProviderSchema = z.object({
    provider: z.literal("ELEVENLABS").describe("Voice provider identifier for ElevenLabs"),
    voiceID: z.string().describe("Unique voice identifier from ElevenLabs voice library"),
});

const HeyGenVoiceProviderSchema = z.object({
    provider: z.literal("HEYGEN").describe("Voice provider identifier for HeyGen"),
    voiceID: z.string().describe("Unique voice identifier from HeyGen voice library"),
});

export const CharacterSchema = z.object({
    name: z.string().max(64).describe("Character's name (maximum 64 characters)"),
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
        .discriminatedUnion("provider", [ElevenLabsVoiceProviderSchema, HeyGenVoiceProviderSchema])
        .optional()
        .describe("Optional voice configuration from either ElevenLabs or HeyGen provider"),
});

export type Character = z.infer<typeof CharacterSchema>;
