import "vitest";

declare module "vitest" {
    export interface ProvidedContext {
        firebaseAuth: {
            email: string;
            password: string;
            proxyURL: `http://${string}:${string}@${string}:${string}`;
            idToken: string;
            refreshToken: string;
            registered: boolean;
            localID: string;
            expiresIn: number;
        };
    }
}
