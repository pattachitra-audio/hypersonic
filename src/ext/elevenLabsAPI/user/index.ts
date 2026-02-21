import z from "zod";
import { ELEVEN_LABS_API_BASE_URL } from "../constants";

// API Response schemas (snake_case from API)
const SubscriptionCurrencySchema = z.enum(["usd", "eur", "inr"]).nullable();

const SubscriptionStatusSchema = z.enum(["trialing", "active", "incomplete", "past_due", "free", "free_disabled"]);

const BillingPeriodSchema = z.enum(["monthly_period", "3_month_period", "6_month_period", "annual_period"]).nullable();

const CharacterRefreshPeriodSchema = z
    .enum(["monthly_period", "3_month_period", "6_month_period", "annual_period"])
    .nullable();

const SubscriptionAPIResponseSchema = z.object({
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
});

const UserAPIResponseSchema = z.object({
    user_id: z.string(),
    subscription: SubscriptionAPIResponseSchema,
    is_new_user: z.boolean(),
    xi_api_key: z.string().nullable().optional(),
    can_use_delayed_payment_methods: z.boolean(),
    is_onboarding_completed: z.boolean(),
    is_onboarding_checklist_completed: z.boolean(),
    first_name: z.string().nullable().optional(),
    is_api_key_hashed: z.boolean().optional().default(false),
    xi_api_key_preview: z.string().nullable().optional(),
    referral_link_code: z.string().nullable().optional(),
    partnerstack_partner_default_link: z.string().nullable().optional(),
    created_at: z.number(),
});

// Output schemas (camelCase with ID/URL uppercase)
const SubscriptionOutputSchema = z.object({
    tier: z.string(),
    characterCount: z.number(),
    characterLimit: z.number(),
    maxCharacterLimitExtension: z.number().nullable(),
    canExtendCharacterLimit: z.boolean(),
    allowedToExtendCharacterLimit: z.boolean(),
    nextCharacterCountResetUnix: z.number().nullable().optional(),
    voiceSlotsUsed: z.number(),
    professionalVoiceSlotsUsed: z.number(),
    voiceLimit: z.number(),
    maxVoiceAddEdits: z.number().nullable().optional(),
    voiceAddEditCounter: z.number(),
    professionalVoiceLimit: z.number(),
    canExtendVoiceLimit: z.boolean(),
    canUseInstantVoiceCloning: z.boolean(),
    canUseProfessionalVoiceCloning: z.boolean(),
    currency: SubscriptionCurrencySchema,
    status: SubscriptionStatusSchema,
    billingPeriod: BillingPeriodSchema,
    characterRefreshPeriod: CharacterRefreshPeriodSchema,
});

const UserOutputSchema = z.object({
    userID: z.string(),
    subscription: SubscriptionOutputSchema,
    isNewUser: z.boolean(),
    xiAPIKey: z.string().nullable().optional(),
    canUseDelayedPaymentMethods: z.boolean(),
    isOnboardingCompleted: z.boolean(),
    isOnboardingChecklistCompleted: z.boolean(),
    firstName: z.string().nullable().optional(),
    isAPIKeyHashed: z.boolean().optional(),
    xiAPIKeyPreview: z.string().nullable().optional(),
    referralLinkCode: z.string().nullable().optional(),
    partnerstackPartnerDefaultLink: z.string().nullable().optional(),
    createdAt: z.number(),
});

// Types
export type SubscriptionCurrency = z.infer<typeof SubscriptionCurrencySchema>;
export type SubscriptionStatus = z.infer<typeof SubscriptionStatusSchema>;
export type BillingPeriod = z.infer<typeof BillingPeriodSchema>;
export type CharacterRefreshPeriod = z.infer<typeof CharacterRefreshPeriodSchema>;
export type Subscription = z.infer<typeof SubscriptionOutputSchema>;
export type User = z.infer<typeof UserOutputSchema>;

// Data fetching function
export async function getUser(): Promise<User> {
    const url = `${ELEVEN_LABS_API_BASE_URL}/user`;

    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ElevenLabs API error (${response.status}): ${errorText}`);
    }

    const rawData = await response.json();

    // Validate the API response
    const validatedData = UserAPIResponseSchema.parse(rawData);

    // Transform snake_case to camelCase with ID/URL uppercase
    return {
        userID: validatedData.user_id,
        subscription: {
            tier: validatedData.subscription.tier,
            characterCount: validatedData.subscription.character_count,
            characterLimit: validatedData.subscription.character_limit,
            maxCharacterLimitExtension: validatedData.subscription.max_character_limit_extension,
            canExtendCharacterLimit: validatedData.subscription.can_extend_character_limit,
            allowedToExtendCharacterLimit: validatedData.subscription.allowed_to_extend_character_limit,
            nextCharacterCountResetUnix: validatedData.subscription.next_character_count_reset_unix,
            voiceSlotsUsed: validatedData.subscription.voice_slots_used,
            professionalVoiceSlotsUsed: validatedData.subscription.professional_voice_slots_used,
            voiceLimit: validatedData.subscription.voice_limit,
            maxVoiceAddEdits: validatedData.subscription.max_voice_add_edits,
            voiceAddEditCounter: validatedData.subscription.voice_add_edit_counter,
            professionalVoiceLimit: validatedData.subscription.professional_voice_limit,
            canExtendVoiceLimit: validatedData.subscription.can_extend_voice_limit,
            canUseInstantVoiceCloning: validatedData.subscription.can_use_instant_voice_cloning,
            canUseProfessionalVoiceCloning: validatedData.subscription.can_use_professional_voice_cloning,
            currency: validatedData.subscription.currency,
            status: validatedData.subscription.status,
            billingPeriod: validatedData.subscription.billing_period,
            characterRefreshPeriod: validatedData.subscription.character_refresh_period,
        },
        isNewUser: validatedData.is_new_user,
        xiAPIKey: validatedData.xi_api_key,
        canUseDelayedPaymentMethods: validatedData.can_use_delayed_payment_methods,
        isOnboardingCompleted: validatedData.is_onboarding_completed,
        isOnboardingChecklistCompleted: validatedData.is_onboarding_checklist_completed,
        firstName: validatedData.first_name,
        isAPIKeyHashed: validatedData.is_api_key_hashed,
        xiAPIKeyPreview: validatedData.xi_api_key_preview,
        referralLinkCode: validatedData.referral_link_code,
        partnerstackPartnerDefaultLink: validatedData.partnerstack_partner_default_link,
        createdAt: validatedData.created_at,
    };
}
