import z from "zod";

export const FineTuningStateSchema = z
    .object({
        eleven_turbo_v2_5: z.string().optional(),
        eleven_flash_v2: z.string().optional(),
        eleven_multilingual_v2: z.string().optional(),
        eleven_v2_5_flash: z.string().optional(),
        eleven_v2_flash: z.string().optional(),
        eleven_turbo_v2: z.string().optional(),
        eleven_flash_v2_5: z.string().optional(),
    })
    .catchall(z.string())
    .transform((v) => ({
        ...v,
        elevenTurbo_v2_5: v.eleven_turbo_v2_5,
        elevenFlash_v2: v.eleven_flash_v2,
        elevenMultilingual_v2: v.eleven_multilingual_v2,
        eleven_v2_5_Flash: v.eleven_v2_5_flash,
        eleven_v2_Flash: v.eleven_v2_flash,
        elevenTurbo_v2: v.eleven_turbo_v2,
        elevenFlash_v2_5: v.eleven_flash_v2_5,
    }));

export const FineTuningProgressSchema = z
    .object({
        eleven_v2_5_flash: z.number().optional(),
        eleven_flash_v2: z.number().optional(),
        eleven_v2_flash: z.number().optional(),
        eleven_flash_v2_5: z.number().optional(),
    })
    .catchall(z.number())
    .transform((v) => ({
        ...v,
        eleven_v2_5_Flash: v.eleven_v2_5_flash,
        elevenFlash_v2: v.eleven_flash_v2,
        eleven_v2_Flash: v.eleven_v2_flash,
        elevenFlash_v2_5: v.eleven_flash_v2_5,
    }));

export const FineTuningMessageSchema = z
    .object({
        eleven_v2_5_flash: z.string().optional(),
        eleven_flash_v2: z.string().optional(),
        eleven_v2_flash: z.string().optional(),
        eleven_flash_v2_5: z.string().optional(),
    })
    .catchall(z.string())
    .transform((v) => ({
        ...v,
        elevenV25Flash: v.eleven_v2_5_flash,
        elevenFlashV2: v.eleven_flash_v2,
        elevenV2Flash: v.eleven_v2_flash,
        elevenFlashV25: v.eleven_flash_v2_5,
    }));

export const FineTuningSchema = z
    .object({
        is_allowed_to_fine_tune: z.boolean().nullable().optional(),
        state: FineTuningStateSchema.nullable().optional(),
        verification_failures: z.array(z.unknown()).nullable().optional(),
        verification_attempts_count: z.number().nullable().optional(),
        manual_verification_requested: z.boolean().nullable().optional(),
        language: z.string().nullable().optional(),
        progress: FineTuningProgressSchema.nullable().optional(),
        message: FineTuningMessageSchema.nullable().optional(),
        dataset_duration_seconds: z.number().nullable().optional(),
        verification_attempts: z.array(z.unknown()).nullable().optional(),
        slice_ids: z.array(z.string()).nullable().optional(),
        manual_verification: z.unknown().nullable().optional(),
        max_verification_attempts: z.number().nullable().optional(),
        next_max_verification_attempts_reset_unix_ms: z.number().nullable().optional(),
    })
    .transform((v) => ({
        ...v,
        isAllowedToFineTune: v.is_allowed_to_fine_tune,
        state: v.state,
        verificationFailures: v.verification_failures,
        verificationAttemptsCount: v.verification_attempts_count,
        manualVerificationRequested: v.manual_verification_requested,
        language: v.language,
        progress: v.progress,
        message: v.message,
        datasetDurationSeconds: v.dataset_duration_seconds,
        verificationAttempts: v.verification_attempts,
        sliceIds: v.slice_ids,
        manualVerification: v.manual_verification,
        maxVerificationAttempts: v.max_verification_attempts,
        nextMaxVerificationAttemptsResetUnixMs: v.next_max_verification_attempts_reset_unix_ms,
    }));

export const LabelsSchema = z
    .object({
        use_case: z.string().optional(),
        gender: z.string().optional(),
        accent: z.string().optional(),
        age: z.string().optional(),
        language: z.string().optional(),
        descriptive: z.string().optional(),
    })
    .catchall(z.string())
    .transform((v) => ({
        ...v,
        useCase: v.use_case,
        gender: v.gender,
        accent: v.accent,
        age: v.age,
        language: v.language,
        descriptive: v.descriptive,
    }));

export const VerifiedLanguageSchema = z
    .object({
        language: z.string().nullable().optional(),
        model_id: z.string().nullable().optional(),
        accent: z.string().nullable().optional(),
        locale: z.string().nullable().optional(),
        preview_url: z.string().nullable().optional(),
    })
    .transform((v) => ({
        ...v,
        language: v.language,
        modelId: v.model_id,
        accent: v.accent,
        locale: v.locale,
        previewUrl: v.preview_url,
    }));

export const VoiceVerificationSchema = z
    .object({
        requires_verification: z.boolean().nullable().optional(),
        is_verified: z.boolean().nullable().optional(),
        verification_failures: z.array(z.unknown()).nullable().optional(),
        verification_attempts_count: z.number().nullable().optional(),
        language: z.string().nullable().optional(),
        verification_attempts: z.array(z.unknown()).nullable().optional(),
    })
    .transform((v) => ({
        ...v,
        requiresVerification: v.requires_verification,
        isVerified: v.is_verified,
        verificationFailures: v.verification_failures,
        verificationAttemptsCount: v.verification_attempts_count,
        language: v.language,
        verificationAttempts: v.verification_attempts,
    }));

export const VoiceSchema = z
    .object({
        voice_id: z.string(),
        name: z.string().nullable().optional(),
        samples: z.array(z.unknown()).nullable().optional(),
        category: z.string().nullable().optional(),
        fine_tuning: FineTuningSchema.nullable().optional(),
        labels: LabelsSchema.nullable().optional(),
        description: z.string().nullable().optional(),
        preview_url: z.string().nullable().optional(),
        available_for_tiers: z.array(z.string()).nullable().optional(),
        settings: z.unknown().nullable().optional(),
        sharing: z.unknown().nullable().optional(),
        high_quality_base_model_ids: z.array(z.string()).nullable().optional(),
        verified_languages: z.array(VerifiedLanguageSchema).nullable().optional(),
        collection_ids: z.array(z.string()).nullable().optional(),
        safety_control: z.unknown().nullable().optional(),
        voice_verification: VoiceVerificationSchema.nullable().optional(),
        permission_on_resource: z.unknown().nullable().optional(),
        is_owner: z.boolean().nullable().optional(),
        is_legacy: z.boolean().nullable().optional(),
        is_mixed: z.boolean().nullable().optional(),
        favorited_at_unix: z.number().nullable().optional(),
        created_at_unix: z.number().nullable().optional(),
        is_bookmarked: z.boolean().nullable().optional(),
        recording_quality: z.string().nullable().optional(),
        labelling_status: z.string().nullable().optional(),
        recording_quality_reason: z.string().nullable().optional(),
    })
    .transform((v) => ({
        ...v,
        voiceId: v.voice_id,
        name: v.name,
        samples: v.samples,
        category: v.category,
        fineTuning: v.fine_tuning,
        labels: v.labels,
        description: v.description,
        previewUrl: v.preview_url,
        availableForTiers: v.available_for_tiers,
        settings: v.settings,
        sharing: v.sharing,
        highQualityBaseModelIds: v.high_quality_base_model_ids,
        verifiedLanguages: v.verified_languages,
        collectionIds: v.collection_ids,
        safetyControl: v.safety_control,
        voiceVerification: v.voice_verification,
        permissionOnResource: v.permission_on_resource,
        isOwner: v.is_owner,
        isLegacy: v.is_legacy,
        isMixed: v.is_mixed,
        favoritedAtUnix: v.favorited_at_unix,
        createdAtUnix: v.created_at_unix,
        isBookmarked: v.is_bookmarked,
        recordingQuality: v.recording_quality,
        labellingStatus: v.labelling_status,
        recordingQualityReason: v.recording_quality_reason,
    }));

export const OutputSchema = z
    .object({
        voices: z.array(VoiceSchema),
    })
    .transform((v) => v.voices);
