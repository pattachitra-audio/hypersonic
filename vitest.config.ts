import { defineConfig } from "vitest/config";
import dotEnv from "dotenv";

if (!process.env.GITHUB_ACTIONS) {
    dotEnv.config({ path: ".env.test", override: true });
}

export default defineConfig({
    // plugins: [tsconfigPaths({ projects: ["./tsconfig.test.json"] })],

    test: {
        testTimeout: 30000,
        alias: {
            "@": "src",
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
        // include: ["test/**/*.ts"],

        projects: [
            {
                test: {
                    name: "elevenLabsInternalAPI",
                    include: ["test/services/elevenLabsInternalAPI/**/*.test.ts"],
                    // maxWorkers: 1,
                    alias: {
                        "@": "src",
                        test: "test",
                    },
                    testTimeout: 120_000,

                    /* alias: {
                        "@/": "src/",
                        // test: path.resolve(__dirname, "test"),
                    }, */
                },
            },
            {
                test: {
                    name: "rest",
                    include: ["test/**/*.test.ts"],
                    exclude: ["test/services/elevenLabsInternalAPI/**/*.test.ts"],
                    alias: {
                        "@": "src",
                        test: "test",
                    },
                },
            },
        ],
    },
});
