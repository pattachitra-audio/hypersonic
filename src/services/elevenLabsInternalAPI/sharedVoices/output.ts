import z from "zod";

const VerifiedLanguageSchema = z
    .object({
        language: z.string(),
        model_id: z.string(),
        accent: z.string(),
        locale: z.string(),
        preview_url: z.string().url(),
    })
    .transform((data) => ({
        language: data.language,
        modelID: data.model_id,
        accent: data.accent,
        locale: data.locale,
        previewURL: data.preview_url,
    }));

export const VoiceSchema = z
    .object({
        public_owner_id: z.string(),
        voice_id: z.string(),
        date_unix: z.number(),
        name: z.string(),
        accent: z.string(),
        gender: z.enum(["male", "female"]).transform((value) => (({ male: "MALE", female: "FEMALE" }) as const)[value]),
        age: z
            .enum(["young", "middle_aged", "old"])
            .transform((value) => (({ young: "YOUNG", middle_aged: "MIDDLE_AGED", old: "OLD" }) as const)[value]),
        descriptive: z.string(),
        use_case: z.string(),
        category: z.enum(["professional", "generated", "cloned", "premade"]).transform(
            (value) =>
                (
                    ({
                        professional: "PROFESSIONAL",
                        generated: "GENERATED",
                        cloned: "CLONED",
                        premade: "PREMADE",
                    }) as const
                )[value],
        ),
        language: z.string(),
        locale: z.string(),
        description: z.string(),
        preview_url: z.url(),
        usage_character_count_1y: z.number(),
        usage_character_count_7d: z.number(),
        play_api_usage_character_count_1y: z.number(),
        cloned_by_count: z.number(),
        rate: z.number(),
        fiat_rate: z.number().nullable(),
        free_users_allowed: z.boolean(),
        live_moderation_enabled: z.boolean(),
        featured: z.boolean(),
        verified_languages: z.array(VerifiedLanguageSchema),
        notice_period: z.number().nullable(),
        // instagram_username: z.string().nullable(),
        // twitter_username: z.string().nullable(),
        // youtube_username: z.string().nullable(),
        // tiktok_username: z.string().nullable(),
        // image_url: z.string(),
        is_added_by_user: z.boolean(),
        // is_bookmarked: z.boolean().nullable(),
    })
    .transform((data) => ({
        publicOwnerID: data.public_owner_id,
        voiceID: data.voice_id,
        dateUnix: data.date_unix,
        name: data.name,
        accent: data.accent,
        gender: data.gender,
        age: data.age,
        descriptive: data.descriptive,
        useCase: data.use_case,
        category: data.category,
        language: data.language,
        locale: data.locale,
        description: data.description,
        previewURL: data.preview_url,
        usageCharacterCount1Y: data.usage_character_count_1y,
        usageCharacterCount7D: data.usage_character_count_7d,
        playAPIUsageCharacterCount1Y: data.play_api_usage_character_count_1y,
        clonedByCount: data.cloned_by_count,
        rate: data.rate,
        fiatRate: data.fiat_rate,
        freeUsersAllowed: data.free_users_allowed,
        liveModerationEnabled: data.live_moderation_enabled,
        featured: data.featured,
        verifiedLanguages: data.verified_languages,
        noticePeriod: data.notice_period,
        // instagramUsername: data.instagram_username,
        // twitterUsername: data.twitter_username,
        // youtubeUsername: data.youtube_username,
        // tiktokUsername: data.tiktok_username,
        // imageURL: data.image_url,
        isAddedByUser: data.is_added_by_user,
        // isBookmarked: data.is_bookmarked,
    }));

export const OutputSchema = z
    .object({
        voices: z.array(VoiceSchema),
        has_more: z.boolean(),
        // last_sort_id: z.string().nullable(),
    })
    .transform((data) => ({
        voices: data.voices,
        hasMore: data.has_more,
        // lastSortID: data.last_sort_id,
    }));
