import z from "zod";

const ElevenLabsPoolAccountSchema = z.object({
    email: z.email(),
    id: z.string().min(2),
    allocationID: z.hex().length(24).optional(),
});

/* function getEmailHostname(email: string) {
    const usernameHostnameArray = email.split("@");

    if (usernameHostnameArray.length !== 2) {
        throw new Error(`Email should be of format <username>@<hostname> | Found '${email}'`);
    }

    return usernameHostnameArray[1];
} */

function shuffleArray(array: string[]) {
    const newArray = array;

    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }

    return newArray;
}

function randomIntegerBetween(begin: number, end: number) {
    if (begin !== Math.trunc(begin)) {
        throw new Error(`Begin value should be an integer | Found begin: ${begin}`);
    }

    if (end !== Math.trunc(end)) {
        throw new Error(`End value should be an integer | Found end: ${end}`);
    }

    if (end < begin) {
        throw new Error(`Being value should be less than the end value | Found begin: ${begin}, end: ${end}`);
    }
    return begin + Math.random() * (end - begin);
}

// const accountsString = fs.readFileSync(path.join(__dirname, "./elevenLabsAccounts.seedData.json"), "utf-8");
// const accountsJSON = JSON.parse(accountsString);

const response = await fetch("http://hypersonic/api/tRPC/elevenLabsPool.get?batch=1", {
    method: "POST",
    body: JSON.stringify({
        "0": {},
    }),
    headers: {
        "Content-Type": "application/json",
    },
});

const accountsJSON = (await response.json())[0].result.data;

const accounts = z.array(ElevenLabsPoolAccountSchema).parse(accountsJSON);
const unallocatedAccountIDs = accounts.filter((value) => value.allocationID == null).map((value) => value.id);

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

let shuffled = shuffleArray(unallocatedAccountIDs);
console.log("shuffled:", shuffled);

while (shuffled.length !== 0) {
    const randomSize = randomIntegerBetween(1, 5);
    const size = Math.min(randomSize, shuffled.length);

    const accountIDs = shuffled.slice(0, size);

    try {
        const response = await fetch("http://hypersonic/api/tRPC/praoAllocation.create?batch=1", {
            method: "POST",
            body: JSON.stringify({
                "0": {
                    accountIDs,
                },
            }),
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (response.status !== 200) {
            throw new Error(`Response status ${response.status}`);
        }

        const allocationID = z
            .object({ allocationID: z.hex().length(24) })
            .parse((await response.json())[0].result.data).allocationID;

        console.log(
            `\x1b[1;32m✓\x1b[m Created allocation '${allocationID}' with account IDs:`,
            JSON.stringify(accountIDs, null, 4),
        );
    } catch {
        console.log(
            "\x1b[1;31m✗\x1b[m Failed create allocation with account IDs:",
            JSON.stringify(accountIDs, null, 4),
        );
    } finally {
        await randomDelay(3000, 10000);
    }

    shuffled = shuffled.slice(size);
}
