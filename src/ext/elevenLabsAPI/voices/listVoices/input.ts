import z from "zod";
import { LIST_VOICES_ENUMS } from "./enums";

const SortBySchema = z.enum(LIST_VOICES_ENUMS.SORT_BY);
const SortDirectionSchema = z.enum(LIST_VOICES_ENUMS.SORT_DIRECTION);
const VoiceTypeSchema = z.enum(LIST_VOICES_ENUMS.VOICE_TYPE);
const FineTuningStateSchema = z.enum(LIST_VOICES_ENUMS.FINE_TUNING);
const VoiceCategorySchema = z.enum(LIST_VOICES_ENUMS.CATEGORY);

export const ListVoicesInputSchema = z.object({
    nextPageToken: z.string().optional(),
    pageSize: z.number().min(1).max(100).default(10),
    search: z.string().optional(),
    sortBy: SortBySchema.optional(),
    sortDirection: SortDirectionSchema.optional(),
    voiceType: VoiceTypeSchema.optional(),
    category: VoiceCategorySchema.optional(),
    fineTuningState: FineTuningStateSchema.optional(),
    collectionID: z.string(),
    includeTotalCount: z.boolean().default(true),
    voiceIDs: z.array(z.string()).max(100).optional(),
});

export type ListVoicesInput = z.infer<typeof ListVoicesInputSchema>;
