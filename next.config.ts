import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "standalone",
    typescript: {
        tsconfigPath: "tsconfig.app.json",
    },
    turbopack: {},
};

export default nextConfig;
