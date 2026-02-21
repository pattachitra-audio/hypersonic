import z from "zod";

const SampleResponseSchema = z
    .object({
        sample_id: z.string(),
        file_name: z.string(),
        mime_type: z.string(),
        size_bytes: z.number(),
        hash: z.string(),
        duration_secs: z.number().nullable().optional(),
        remove_background_noise: z.boolean().nullable().optional(),
        has_isolated_audio: z.boolean().nullable().optional(),
        has_isolated_audio_preview: z.boolean().nullable().optional(),
        trim_start: z.number().nullable().optional(),
        trim_end: z.number().nullable().optional(),
    })
    .transform(
        ({
            sample_id: sampleID,
            file_name: fileName,
            mime_type: mimeType,
            size_bytes: sizeBytes,
            duration_secs: durationSecs,
            remove_background_noise: removeBackgroundNoise,
            has_isolated_audio: hasIsolatedAudio,
            has_isolated_audio_preview: hasIsolatedAudioPreview,
            trim_start: trimStart,
            trim_end: trimEnd,
            ...rest
        }) => ({
            sampleID,
            fileName,
            mimeType,
            sizeBytes,
            durationSecs,
            removeBackgroundNoise,
            hasIsolatedAudio,
            hasIsolatedAudioPreview,
            trimStart,
            trimEnd,
            ...rest,
        }),
    );

const VoiceSettingsResponseSchema = z
    .object({
        stability: z.number().nullable().optional(),
        use_speaker_boost: z.boolean().nullable().optional(),
        similarity_boost: z.number().nullable().optional(),
        style: z.number().nullable().optional(),
        speed: z.number().nullable().optional(),
    })
    .transform(({ use_speaker_boost: useSpeakerBoost, similarity_boost: similarityBoost, ...rest }) => ({
        useSpeakerBoost,
        similarityBoost,
        ...rest,
    }));

const VoiceResponseSchema = z
    .object({
        voice_id: z.string(),
        name: z.string(),
        samples: z.array(SampleResponseSchema).nullable().optional(),
        category: z.enum(["generated", "cloned", "premade", "professional", "famous", "high_quality"]),
        labels: z.record(z.string(), z.string()).optional(),
        description: z.string().nullable().optional(),
        preview_url: z.string().nullable().optional(),
        available_for_tiers: z.array(z.string()),
        settings: VoiceSettingsResponseSchema.nullable().optional(),
        high_quality_base_model_ids: z.array(z.string()),
        collection_ids: z.array(z.string()).nullable().optional(),
        is_owner: z.boolean().nullable().optional(),
        is_legacy: z.boolean().optional(),
        is_mixed: z.boolean().optional(),
        favorited_at_unix: z.number().nullable().optional(),
        created_at_unix: z.number().nullable().optional(),
    })
    .transform(
        ({
            voice_id: voiceID,
            category,
            preview_url: previewURL,
            available_for_tiers: availableForTiers,
            high_quality_base_model_ids: highQualityBaseModelIDs,
            collection_ids: collectionIDs,
            is_owner: isOwner,
            is_legacy: isLegacy,
            is_mixed: isMixed,
            favorited_at_unix: favoritedAtUnix,
            created_at_unix: createdAtUnix,
            ...rest
        }) => ({
            voiceID,
            category: {
                generated: "GENERATED",
                cloned: "CLONED",
                premade: "PREMADE",
                professional: "PROFESSIONAL",
                high_quality: "HIGH_QUALITY",
                famous: "FAMOUS",
            }[category],
            previewURL,
            availableForTiers,
            highQualityBaseModelIDs,
            collectionIDs,
            isOwner,
            isLegacy,
            isMixed,
            favoritedAtUnix,
            createdAtUnix,
            ...rest,
        }),
    );

export const ListVoicesResponseSchema = z
    .object({
        voices: z.array(VoiceResponseSchema),
        has_more: z.boolean(),
        total_count: z.number(),
        next_page_token: z.string().nullable().optional(),
    })
    .transform(({ has_more, total_count, next_page_token }) => ({
        hasMore: has_more,
        totalCount: total_count,
        nextPageToken: next_page_token,
    }));

export type VoiceResponse = z.output<typeof VoiceResponseSchema>;
