import { describe, expect, it, inject } from "vitest";
import { userPermissions } from "@/services/elevenLabsInternalAPI/userPermissions";

describe("userPermissions", async () => {
    it("returns auth account data for a valid bearer token", async () => {
        const firebaseAuth = inject("firebaseAuth");

        const result = await userPermissions({
            proxyURL: firebaseAuth.proxyURL,
            bearerToken: firebaseAuth.idToken,
        });

        if (result.isErr()) {
            throw new Error("Error fetching auth account", { cause: result.error });
        }

        expect(result.isOk()).toBe(true);

        expect(result.value).toContain("view_fiat_balance");
        expect(result.value).toContain("copy_resources_cross_workspace");
        expect(result.value).toContain("workspace_members_invite");
        expect(result.value).toContain("dubbing");
        expect(result.value).toContain("projects");
        expect(result.value).toContain("terms_of_service_accept");
        expect(result.value).toContain("ads_manage_integrations");
        expect(result.value).toContain("voiceover_studio");
        expect(result.value).toContain("ai_speech_classifier");
        expect(result.value).toContain("conversational_ai");
        expect(result.value).toContain("ads_read");
        expect(result.value).toContain("speech_to_text");
        expect(result.value).toContain("audit_log_read");
        expect(result.value).toContain("voice_lab");
        expect(result.value).toContain("service_accounts_manage");
        expect(result.value).toContain("workspace_members_remove");
        expect(result.value).toContain("share_voice_externally");
        expect(result.value).toContain("publish_studio_project");
        expect(result.value).toContain("ads_publish");
        expect(result.value).toContain("workspace_analytics_full_read");
        expect(result.value).toContain("voice_isolator");
        expect(result.value).toContain("ads_edit");
        expect(result.value).toContain("music");
        expect(result.value).toContain("create_professional_voice_clone");
        expect(result.value).toContain("text_to_speech");
        expect(result.value).toContain("add_voice_from_voice_library");
        expect(result.value).toContain("image_video_generation");
        expect(result.value).toContain("webhooks_manage");
        expect(result.value).toContain("audio_native");
        expect(result.value).toContain("create_instant_voice_clone");
        expect(result.value).toContain("create_user_api_key");
        expect(result.value).toContain("group_members_manage");
        expect(result.value).toContain("speech_to_speech");
        expect(result.value).toContain("publish_voice_to_voice_library");
        expect(result.value).toContain("sound_effects");
    });
});
