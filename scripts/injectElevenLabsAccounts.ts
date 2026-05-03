import z from "zod";
import fs from "node:fs";
import path from "node:path";

const __dirname = import.meta.dirname;

const ElevenLabsAccountSchema = z
    .object({
        email: z.email(),
        password: z.string(),
        proxyURL: z.string().transform((url) => {
            if (url.startsWith("http://")) {
                url = url.slice(7);
            }

            const [x, y] = url.split("@");
            const [username, password] = x.split(":");
            const [host, port] = y.split(":");

            return {
                username,
                password,
                host,
                port: parseInt(port),
            };
        }),
    })
    .transform(({ proxyURL, ...rest }) => ({ proxy: proxyURL, ...rest }));

const accountsString = fs.readFileSync(path.join(__dirname, "./elevenLabsAccounts.seedData.json"), "utf-8");
const accountsJSON = JSON.parse(accountsString);
const accounts = z.array(ElevenLabsAccountSchema).parse(accountsJSON);

function delay(millis: number) {
    return new Promise<void>((resolve) => {
        setTimeout(() => resolve(), millis);
    });
}

function random(begin: number, end: number) {
    const diff = end - begin;

    return begin + Math.trunc(Math.random() * diff);
}

function randomDelay(begin: number, end: number) {
    return delay(random(begin, end));
}

for (let i = 0; i < accounts.length; i++) {
    const account = accounts[i];

    try {
        const response = await fetch("http://hypersonic/api/tRPC/elevenLabsPool.add?batch=1", {
            method: "POST",
            body: JSON.stringify({
                "0": {
                    ...account,
                },
            }),
            headers: {
                "content-type": "application/json",
            },
        });

        if (response.status !== 200) {
            throw new Error(`Response status ${response.status}`);
        }

        console.log("\x1b[1;32m✓\x1b[m Added account: ", account.email);
    } catch {
        console.log("\x1b[1;31m✗\x1b[m Failed to add account: ", account.email);
    } finally {
        await randomDelay(7000, 13000);
    }
}
