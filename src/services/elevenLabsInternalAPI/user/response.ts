import z from "zod";

const OnboardingSurveySchema = z
    .object({
        first_name: z.string().nullable().optional(),
        last_name: z.string().nullable().optional(),
        role: z.string().nullable().optional(),
        source: z.string().nullable().optional(),
        timezone: z.string().nullable().optional(),
        subrole: z.string().nullable().optional(),
    })
    .nullable()
    .optional()
    .transform((data) =>
        data
            ? {
                  firstName: data.first_name,
                  lastName: data.last_name,
                  role: data.role,
                  source: data.source,
                  timezone: data.timezone,
                  subrole: data.subrole,
              }
            : data,
    );

const SubscriptionCurrencySchema = z.enum(["usd", "eur", "inr"]).nullable();
const SubscriptionStatusSchema = z.enum(["trialing", "active", "incomplete", "past_due", "free", "free_disabled"]);
const BillingPeriodSchema = z.enum(["monthly_period", "3_month_period", "6_month_period", "annual_period"]).nullable();
const CharacterRefreshPeriodSchema = z
    .enum(["monthly_period", "3_month_period", "6_month_period", "annual_period"])
    .nullable();

const SubscriptionSchema = z
    .object({
        tier: z.string(),
        character_count: z.number(),
        character_limit: z.number(),
        max_character_limit_extension: z.number().nullable(),
        can_extend_character_limit: z.boolean(),
        allowed_to_extend_character_limit: z.boolean(),
        next_character_count_reset_unix: z.number().nullable().optional(),
        voice_slots_used: z.number(),
        professional_voice_slots_used: z.number(),
        voice_limit: z.number(),
        max_voice_add_edits: z.number().nullable().optional(),
        voice_add_edit_counter: z.number(),
        professional_voice_limit: z.number(),
        can_extend_voice_limit: z.boolean(),
        can_use_instant_voice_cloning: z.boolean(),
        can_use_professional_voice_cloning: z.boolean(),
        currency: SubscriptionCurrencySchema,
        status: SubscriptionStatusSchema,
        billing_period: BillingPeriodSchema,
        character_refresh_period: CharacterRefreshPeriodSchema,
    })
    .transform((data) => ({
        tier: data.tier,
        characterCount: data.character_count,
        characterLimit: data.character_limit,
        maxCharacterLimitExtension: data.max_character_limit_extension,
        canExtendCharacterLimit: data.can_extend_character_limit,
        allowedToExtendCharacterLimit: data.allowed_to_extend_character_limit,
        nextCharacterCountResetUnix: data.next_character_count_reset_unix,
        voiceSlotsUsed: data.voice_slots_used,
        professionalVoiceSlotsUsed: data.professional_voice_slots_used,
        voiceLimit: data.voice_limit,
        maxVoiceAddEdits: data.max_voice_add_edits,
        voiceAddEditCounter: data.voice_add_edit_counter,
        professionalVoiceLimit: data.professional_voice_limit,
        canExtendVoiceLimit: data.can_extend_voice_limit,
        canUseInstantVoiceCloning: data.can_use_instant_voice_cloning,
        canUseProfessionalVoiceCloning: data.can_use_professional_voice_cloning,
        currency: data.currency,
        status: data.status,
        billingPeriod: data.billing_period,
        characterRefreshPeriod: data.character_refresh_period,
    }));

export const ResponseSchema = z
    .object({
        user_id: z.string(),
        subscription: SubscriptionSchema,
        subscription_extras: z.unknown().nullable().optional(),
        is_new_user: z.boolean(),
        xi_api_key: z.string().nullable().optional(),
        can_use_delayed_payment_methods: z.boolean(),
        is_onboarding_completed: z.boolean(),
        is_onboarding_checklist_completed: z.boolean(),
        show_compliance_terms: z.boolean().optional().default(false),
        first_name: z.string().nullable().optional(),
        is_api_key_hashed: z.boolean().optional().default(false),
        xi_api_key_preview: z.string().nullable().optional(),
        referral_link_code: z.string().nullable().optional(),
        partnerstack_partner_default_link: z.string().nullable().optional(),
        created_at: z.number(),
        seat_type: z.string().nullable().optional(),
        workspace_id: z.string().nullable().optional(),
        public_user_id: z.string().nullable().optional(),
        profile_page_handle: z.string().nullable().optional(),
        email: z.string().nullable().optional(),
        usage_limit: z.number().nullable().optional(),
        calculated_usage_limit: z.number().nullable().optional(),
        character_count: z.number().optional(),
        billing_group_id: z.string().nullable().optional(),
        is_producer: z.boolean().optional().default(false),
        onboarding_survey: OnboardingSurveySchema,
        onboarding_checklist: z.unknown().nullable().optional(),
        // prompts_shown: z.record(z.unknown()).nullable().optional(),
        sidebar_preferences: z.unknown().nullable().optional(),
    })
    .transform((data) => ({
        userID: data.user_id,
        subscription: data.subscription,
        subscriptionExtras: data.subscription_extras,
        isNewUser: data.is_new_user,
        xiAPIKey: data.xi_api_key,
        canUseDelayedPaymentMethods: data.can_use_delayed_payment_methods,
        isOnboardingCompleted: data.is_onboarding_completed,
        isOnboardingChecklistCompleted: data.is_onboarding_checklist_completed,
        showComplianceTerms: data.show_compliance_terms,
        firstName: data.first_name,
        isAPIKeyHashed: data.is_api_key_hashed,
        xiAPIKeyPreview: data.xi_api_key_preview,
        referralLinkCode: data.referral_link_code,
        partnerstackPartnerDefaultLink: data.partnerstack_partner_default_link,
        createdAt: data.created_at,
        seatType: data.seat_type,
        workspaceID: data.workspace_id,
        publicUserID: data.public_user_id,
        profilePageHandle: data.profile_page_handle,
        email: data.email,
        usageLimit: data.usage_limit,
        calculatedUsageLimit: data.calculated_usage_limit,
        characterCount: data.character_count,
        billingGroupID: data.billing_group_id,
        isProducer: data.is_producer,
        onboardingSurvey: data.onboarding_survey,
        onboardingChecklist: data.onboarding_checklist,
        // promptsShown: data.prompts_shown,
        sidebarPreferences: data.sidebar_preferences,
    }))
    .transform((data) => {
        if (data.userID.startsWith("user_")) {
            data.userID = data.userID.slice(5);
        }

        return data;
    });

export type ResponseType = z.infer<typeof ResponseSchema>;
