import { NoThrow } from "@/utils/NoThrow";
import { signInWithPassword } from "@/services/elevenLabsFirebase/signInWithPassword";
import { parseProxyURL } from "@/utils/parseProxyURL";

export async function setupFirebaseAuth() {
    const email = process.env.TEST_EMAIL;
    const password = process.env.TEST_PASSWORD;

    const proxyURLString = process.env.TEST_PROXY_URL;

    if (!email) {
        return NoThrow.err(new Error(`Env variable 'TEST_EMAIL' must be present`));
    }

    if (!password) {
        return NoThrow.err(new Error(`Env variable 'TEST_PASSWORD' must be present`));
    }

    if (!proxyURLString) {
        return NoThrow.err(new Error(`Env variable 'TEST_PROXY_URL' must be present`));
    }

    const proxyURLResult = parseProxyURL(proxyURLString);

    if (proxyURLResult.isErr()) {
        return proxyURLResult;
    }

    const result = await signInWithPassword({
        email,
        password,
        proxyURL: proxyURLResult.value,
    });

    if (result.isErr()) {
        return result;
    }

    return NoThrow.ok({
        ...result.value,
        email,
        password,
        proxyURL: proxyURLResult.value,
    });
}
