import { describe, expect, it } from "vitest";
import { inject } from "vitest";
import { getAccountInfo } from "@/services/elevenLabsFirebase/getAccountInfo";

describe("getAccountInfo", async () => {
    it("get account info from a valid ID token", async () => {
        const firebaseAuth = inject("firebaseAuth");

        const accountInfoResult = await getAccountInfo({
            idToken: firebaseAuth.idToken,
        });

        if (accountInfoResult.isErr()) {
            console.error(accountInfoResult.error);
            throw new Error("Error getting 'account info' from 'ID token'");
        }

        expect(accountInfoResult.isOk()).toBe(true);
        console.log("accountInfo:", JSON.stringify(accountInfoResult.value, null, 4));
    });
});
