import z from "zod";

const GeoLocationSchema = z.object({
    country: z.string(),
    region: z.string(),
    city: z.string(),
});

const TermsAgreedToSchema = z
    .object({
        conversational_ai_agreement_unix_timestamp: z.number().nullable(),
        voice_design_agreement_unix_timestamp: z.number().nullable(),
        publishing_payouts_agreement_unix_timestamp: z.number().nullable(),
        batch_calling_agreement_unix_timestamp: z.number().nullable(),
    })
    .transform((data) => ({
        conversationalAIAgreementUnixTimestamp: data.conversational_ai_agreement_unix_timestamp,
        voiceDesignAgreementUnixTimestamp: data.voice_design_agreement_unix_timestamp,
        publishingPayoutsAgreementUnixTimestamp: data.publishing_payouts_agreement_unix_timestamp,
        batchCallingAgreementUnixTimestamp: data.batch_calling_agreement_unix_timestamp,
    }));

export const ResponseSchema = z
    .object({
        auth_account_id: z.string(),
        created_at_unix: z.number(),
        email: z.email(),
        is_mfa_enabled: z.boolean(),
        mfa_type: z.string().nullable(),
        agrees_to_product_updates: z.boolean(),
        locale: z.string(),
        moderation_warning_dismissed: z.boolean(),
        is_in_probation: z.boolean(),
        geo_location: GeoLocationSchema,
        terms_agreed_to: TermsAgreedToSchema,
        ccpa_opt_out: z.boolean(),
        accepted_bipa_terms: z.boolean(),
        first_name: z.string(),
    })
    .transform((data) => ({
        authAccountID: data.auth_account_id,
        createdAtUnix: data.created_at_unix,
        email: data.email,
        isMFAEnabled: data.is_mfa_enabled,
        mfaType: data.mfa_type,
        agreesToProductUpdates: data.agrees_to_product_updates,
        locale: data.locale,
        moderationWarningDismissed: data.moderation_warning_dismissed,
        isInProbation: data.is_in_probation,
        geoLocation: data.geo_location,
        termsAgreedTo: data.terms_agreed_to,
        ccpaOptOut: data.ccpa_opt_out,
        acceptedBIPATerms: data.accepted_bipa_terms,
        firstName: data.first_name,
    }));
