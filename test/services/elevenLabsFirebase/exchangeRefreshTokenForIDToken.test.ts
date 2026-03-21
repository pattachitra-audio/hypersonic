import { describe, expect, it } from "vitest";
import { inject } from "vitest";
import { exchangeRefreshTokenForIDToken } from "@/services/elevenLabsFirebase/exchangeRefreshTokenForIDToken";

describe("exchangeRefreshTokenForIDToken", async () => {
    it("returns id token from a valid refresh token", async () => {
        const firebaseAuth = inject("firebaseAuth");

        const idTokenResult = await exchangeRefreshTokenForIDToken({
            proxyURL: firebaseAuth.proxyURL,
            refreshToken: firebaseAuth.refreshToken,
        });

        if (idTokenResult.isErr()) {
            throw new Error("Error getting 'ID token' from 'refresh token'", { cause: idTokenResult.error });
        }

        expect(idTokenResult.isOk()).toBe(true);
    });
});
