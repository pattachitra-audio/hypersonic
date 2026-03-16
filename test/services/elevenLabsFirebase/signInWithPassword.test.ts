import { describe, expect, it } from "vitest";
import { signInWithPassword } from "@/services/elevenLabsFirebase/signInWithPassword";
import { parseProxyURL } from "@/utils/parseProxyURL";
import { decodeElevenLabsFirebaseJWTPayload } from "@/utils/decodeElevenLabsFirebaseJWTPayload";

describe("signInWithPassword", async () => {
    it("returns ID token and refresh token for valid credentials", async () => {
        const email = process.env.EMAIL;
        const password = process.env.PASSWORD;
        const proxyURLVariable = process.env.PROXY_URL;

        if (!email) {
            throw new Error("EMAIL env variable is required");
        }

        if (!password) {
            throw new Error("PASSWORD env variable is required");
        }

        if (!proxyURLVariable) {
            throw new Error("PROXY_URL env variable is required");
        }

        const proxyURLResult = parseProxyURL(proxyURLVariable);

        if (proxyURLResult.isErr()) {
            throw proxyURLResult.error;
        }

        const proxyURL = proxyURLResult.value;

        const result = await signInWithPassword({
            email,
            password,
            proxyURL,
        });

        expect(result.isOk()).toBe(true);

        if (result.isErr()) {
            throw new Error("Error signing in", { cause: result.error });
        }

        const elevenLabsFirebaseJWTResult = await decodeElevenLabsFirebaseJWTPayload(result.value.idToken);

        if (elevenLabsFirebaseJWTResult.isErr()) {
            throw new Error("Error decoding JWT payload from ID token");
        }

        expect(elevenLabsFirebaseJWTResult.isOk()).toBe(true);
    });
});
