import { describe, it } from "vitest";
import { signInWithPassword } from "@/services/elevenLabsFirebase/signInWithPassword";
import { parseProxyURL } from "@/brands/proxyURL";

describe("elevenLabsAuthChain", async () => {
    it("signs in, refreshes token, hits internal API", async () => {
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

        if (result.isOk()) {
            console.log(result.value);
        }
    });
});
