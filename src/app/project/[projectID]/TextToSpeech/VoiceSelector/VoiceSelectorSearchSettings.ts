import z from "zod";

export const VOICE_SELECTOR_SETTINGS_ENUMS = {
    SORT: ["CREATED_AT", "NAME"],
    VOICE_TYPE: ["PERSONAL", "COMMUNITY", "DEFAULT", "WORKSPACE", "NON_DEFAULT", "SAVED"],
    CATEGORY: ["PREMADE", "CLONED", "GENERATED", "PROFESSIONAL"],
    FINE_TUNING: ["DRAFT", "NOT_VERIFIED", "NOT_STARTED", "QUEUED", "FINE_TUNED", "FAILED", "DELAYED"],
    SORT_DIRECTION: ["ASCENDING", "DESCENDING"],
} as const;

export const VoiceSelectorSearchSettingsSchema = z.object({
    pageSize: z.number().min(1).max(100).default(10),
    querySearch: z.string(),
    sort: z.enum(VOICE_SELECTOR_SETTINGS_ENUMS.SORT).nullable().default(null),
    sortDirection: z.enum(VOICE_SELECTOR_SETTINGS_ENUMS.SORT_DIRECTION).nullable().default(null),
    voiceType: z.enum(VOICE_SELECTOR_SETTINGS_ENUMS.VOICE_TYPE).nullable().default(null),

    category: z.enum(VOICE_SELECTOR_SETTINGS_ENUMS.CATEGORY).nullable().default(null),
    fineTuning: z.enum(VOICE_SELECTOR_SETTINGS_ENUMS.FINE_TUNING).nullable().default(null),
    includeTotalCount: z.boolean().nullable().default(null),
    collectionID: z.string().nullable().default(null),
    voiceIDs: z.array(z.string()).nullable().default(null),
});

export type VoiceSelectorSearchSettings = z.infer<typeof VoiceSelectorSearchSettingsSchema>;
