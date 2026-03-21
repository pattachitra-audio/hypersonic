import { z } from "zod";

const DialogueItemSchema = z
    .object({
        text: z.string(),
        voice_id: z.string(),
        voice_name: z.string(),
    })
    .transform(({ voice_id, voice_name, ...rest }) => ({
        ...rest,
        voiceID: voice_id,
        voiceName: voice_name,
    }));

const SettingsSchema = z.object({
    stability: z.number(),
});

const HistoryItemSchema = z
    .object({
        history_item_id: z.string(),
        request_id: z.string(),
        voice_id: z.string().nullable(),
        model_id: z.string(),
        voice_name: z.string().nullable(),
        voice_category: z.string().nullable(),
        text: z.string().nullable(),
        date_unix: z.number(),
        character_count_change_from: z.number(),
        character_count_change_to: z.number(),
        content_type: z.string(),
        state: z.string(),
        settings: SettingsSchema,
        feedback: z.unknown().nullable(),
        share_link_id: z.string().nullable(),
        source: z.string(),
        alignments: z.unknown().nullable(),
        dialogue: z.array(DialogueItemSchema).nullable(),
        output_format: z.string(),
    })
    .transform(
        ({
            history_item_id,
            request_id,
            voice_id,
            model_id,
            voice_name,
            voice_category,
            date_unix,
            character_count_change_from,
            character_count_change_to,
            content_type,
            share_link_id,
            output_format,
            ...rest
        }) => ({
            ...rest,
            historyItemID: history_item_id,
            requestID: request_id,
            voiceID: voice_id,
            modelID: model_id,
            voiceName: voice_name,
            voiceCategory: voice_category,
            dateUnix: date_unix,
            characterCountChange: {
                from: character_count_change_from,
                to: character_count_change_to,
            },
            contentType: content_type,
            shareLinkID: share_link_id,
            outputFormat: output_format,
        }),
    );

export const ResponseSchema = z
    .object({
        history: z.array(HistoryItemSchema),
        last_history_item_id: z.string().nullable(),
        has_more: z.boolean(),
        scanned_until: z.number().nullable(),
    })
    .transform(({ history, last_history_item_id, has_more, scanned_until }) => ({
        history,
        lastHistoryItemID: last_history_item_id,
        more: has_more,
        scannedUntil: scanned_until,
    }));

export type HistoryResponse = z.output<typeof ResponseSchema>;
