import { describe, expect, it, inject } from "vitest";
import { geolocation } from "@/services/elevenLabsInternalAPI/geolocation";

describe("geolocation", async () => {
    it("returns geolocation data", async () => {
        const firebaseAuth = inject("firebaseAuth");

        const locationResult = await geolocation({
            proxyURL: firebaseAuth.proxyURL,
            bearerToken: firebaseAuth.idToken,
        });

        if (locationResult.isErr()) {
            throw new Error("Error fetching history", { cause: locationResult.error });
        }

        expect(locationResult.isOk()).toBe(true);

        const location = locationResult.value;
        console.log("Location:", JSON.stringify(location, null, 4));
    });
});
