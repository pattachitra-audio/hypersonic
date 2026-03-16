import path from "node:path";
import { defineConfig } from "vitest/config";
import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

export default defineConfig({
    test: {
        alias: {
            "@": path.resolve(__dirname, "src"),
        },
        typecheck: {
            tsconfig: "./tsconfig.test.json",
        },
    },
});
