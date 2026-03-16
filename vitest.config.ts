import path from "node:path";
import { defineConfig } from "vitest/config";

import dotEnv from "dotenv";
dotEnv.config({ path: ".env.test", override: true });

export default defineConfig({
    test: {
        alias: {
            "@": path.resolve(__dirname, "src"),
        },
        globalSetup: "test/globalSetup",
        typecheck: {
            tsconfig: "tsconfig.test.json",
        },
    },
});
