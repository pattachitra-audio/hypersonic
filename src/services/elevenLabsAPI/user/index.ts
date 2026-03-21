import z from "zod";
import { NoThrow } from "@/utils/NoThrow";
import { ELEVEN_LABS_API_BASE_URL } from "../constants";
import { fetch as undiciFetch, Response } from "undici";

import { ElevenLabsAccountWithProxyDocumentType } from "@/repository/ElevenLabsAccountWithProxyRepository";
import { proxyAgentPool } from "@/lib/proxyAgentPool";

const SubscriptionCurrencySchema = z.enum(["usd", "eur", "inr"]).nullable();
const SubscriptionStatusSchema = z.enum(["trialing", "active", "incomplete", "past_due", "free", "free_disabled"]);
const BillingPeriodSchema = z.enum(["monthly_period", "3_month_period", "6_month_period", "annual_period"]).nullable();
const CharacterRefreshPeriodSchema = z
    .enum(["monthly_period", "3_month_period", "6_month_period", "annual_period"])
    .nullable();

const SubscriptionAPIResponseSchema = z
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

const UserAPIResponseSchema = z
    .object({
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
    })
    .transform((data) => ({
        userID: data.user_id,
        subscription: data.subscription,
        isNewUser: data.is_new_user,
        xiAPIKey: data.xi_api_key,
        canUseDelayedPaymentMethods: data.can_use_delayed_payment_methods,
        isOnboardingCompleted: data.is_onboarding_completed,
        isOnboardingChecklistCompleted: data.is_onboarding_checklist_completed,
        firstName: data.first_name,
        isAPIKeyHashed: data.is_api_key_hashed,
        xiAPIKeyPreview: data.xi_api_key_preview,
        referralLinkCode: data.referral_link_code,
        partnerstackPartnerDefaultLink: data.partnerstack_partner_default_link,
        createdAt: data.created_at,
    }))
    .transform((data) => {
        if (data.userID.startsWith("user_")) {
            data.userID = data.userID.slice(5);
        }

        return data;
    });

export type SubscriptionCurrency = z.infer<typeof SubscriptionCurrencySchema>;
export type SubscriptionStatus = z.infer<typeof SubscriptionStatusSchema>;
export type BillingPeriod = z.infer<typeof BillingPeriodSchema>;
export type CharacterRefreshPeriod = z.infer<typeof CharacterRefreshPeriodSchema>;

export async function getUser({
    apiKey,
    proxyURL,
}: {
    apiKey: ElevenLabsAccountWithProxyDocumentType["apiKey"];
    proxyURL: ElevenLabsAccountWithProxyDocumentType["proxyURL"];
}) {
    const url = `${ELEVEN_LABS_API_BASE_URL}/user`;
    let response: Response;

    try {
        response = await undiciFetch(url, {
            headers: {
                "Content-Type": "application/json",
                "XI-API-KEY": apiKey,
            },
            dispatcher: proxyAgentPool.get(proxyURL),
        });
    } catch (error) {
        if (error instanceof TypeError) {
            return NoThrow.err(error);
        }

        if (error instanceof SyntaxError) {
            return NoThrow.err(error);
        }

        if (error instanceof DOMException) {
            return NoThrow.err(error);
        }

        return NoThrow.err(new Error("Unknown error"));
    }

    let rawData: unknown;

    try {
        rawData = await response.json();
    } catch (error) {
        if (error instanceof TypeError) {
            return NoThrow.err(error);
        }

        if (error instanceof SyntaxError) {
            return NoThrow.err(error);
        }

        if (error instanceof DOMException) {
            return NoThrow.err(error);
        }

        return NoThrow.err(new Error("Unknown error"));
    }

    const validatedDataResult = await UserAPIResponseSchema.safeParseAsync(rawData);

    if (!validatedDataResult.success) {
        return NoThrow.err(validatedDataResult.error);
    }

    return NoThrow.ok(validatedDataResult.data);
}
