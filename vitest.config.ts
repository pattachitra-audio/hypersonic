import path from "node:path";
import { defineConfig } from "vitest/config";
import dotEnv from "dotenv";

if (!process.env.GITHUB_ACTIONS) {
    dotEnv.config({ path: ".env.test", override: true });
}

export default defineConfig({
    test: {
        alias: {
            "@": path.resolve(__dirname, "src"),
        },
        globalSetup: "test/globalSetup",
        typecheck: {
            tsconfig: "tsconfig.test.json",
        },
        coverage: {
            provider: "v8",
            reporter: ["text", "html", "lcov", "json"],
            reportsDirectory: "./coverage",
            include: ["src/**/*.ts"],
        },
    },
});
