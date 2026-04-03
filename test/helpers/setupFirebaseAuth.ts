import { signInWithPassword } from "@/services/elevenLabsFirebase/signInWithPassword";
import { parseProxyURL } from "@/brands/proxyURL";
import { errAsync } from "neverthrow";

export function setupFirebaseAuth() {
    const email = process.env.TEST_EMAIL;
    const password = process.env.TEST_PASSWORD;

    const proxyURLString = process.env.TEST_PROXY_URL;

    if (!email) {
        return errAsync(new Error(`Env variable 'TEST_EMAIL' must be present`));
    }

    if (!password) {
        return errAsync(new Error(`Env variable 'TEST_PASSWORD' must be present`));
    }

    if (!proxyURLString) {
        return errAsync(new Error(`Env variable 'TEST_PROXY_URL' must be present`));
    }

    return parseProxyURL(proxyURLString).asyncAndThen((proxyURL) => {
        return signInWithPassword({
            email,
            password,
            proxyURL,
        }).map((value) => ({ ...value, email, password, proxyURL }));
    });
}
