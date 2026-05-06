import z from "zod";

export const LanguageSchema = z
    .object({
        language_id: z.string(),
        name: z.string(),
    })
    .transform((val) => ({
        ...val,
        languageId: val.language_id,
        name: val.name,
    }));

export const ModelRatesSchema = z
    .object({
        character_cost_multiplier: z.number().nullable().optional(),
        cost_discount_multiplier: z.number().nullable().optional(),
    })
    .transform((val) => ({
        ...val,
        characterCostMultiplier: val.character_cost_multiplier,
        costDiscountMultiplier: val.cost_discount_multiplier,
    }));

export const ModelSchema = z
    .object({
        model_id: z.string(),
        name: z.string().nullable().optional(),
        can_be_finetuned: z.boolean().nullable().optional(),
        can_do_text_to_speech: z.boolean().nullable().optional(),
        can_do_voice_conversion: z.boolean().nullable().optional(),
        can_use_style: z.boolean().nullable().optional(),
        can_use_speaker_boost: z.boolean().nullable().optional(),
        serves_pro_voices: z.boolean().nullable().optional(),
        token_cost_factor: z.number().nullable().optional(),
        description: z.string().nullable().optional(),
        requires_alpha_access: z.boolean().nullable().optional(),
        max_characters_request_free_user: z.number().nullable().optional(),
        max_characters_request_subscribed_user: z.number().nullable().optional(),
        maximum_text_length_per_request: z.number().nullable().optional(),
        languages: z.array(LanguageSchema).nullable().optional(),
        model_rates: ModelRatesSchema.nullable().optional(),
        concurrency_group: z.string().nullable().optional(),
    })
    .transform((val) => ({
        ...val,
        modelId: val.model_id,
        name: val.name,
        canBeFinetuned: val.can_be_finetuned,
        canDoTextToSpeech: val.can_do_text_to_speech,
        canDoVoiceConversion: val.can_do_voice_conversion,
        canUseStyle: val.can_use_style,
        canUseSpeakerBoost: val.can_use_speaker_boost,
        servesProVoices: val.serves_pro_voices,
        tokenCostFactor: val.token_cost_factor,
        description: val.description,
        requiresAlphaAccess: val.requires_alpha_access,
        maxCharactersRequestFreeUser: val.max_characters_request_free_user,
        maxCharactersRequestSubscribedUser: val.max_characters_request_subscribed_user,
        maximumTextLengthPerRequest: val.maximum_text_length_per_request,
        languages: val.languages,
        modelRates: val.model_rates,
        concurrencyGroup: val.concurrency_group,
    }));

export const OutputSchema = z.array(ModelSchema);
