import type { ProxyURLBrand } from "@/brands/proxyURL";
import "vitest";

declare module "vitest" {
    export interface ProvidedContext {
        firebaseAuth: {
            email: string;
            password: string;
            proxyURL: ProxyURLBrand;
            idToken: string;
            refreshToken: string;
            registered: boolean;
            localID: string;
            expiresIn: number;
        };
    }
}
