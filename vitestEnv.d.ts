import "vitest";

declare module "vitest" {
    export interface ProvidedContext {
        firebaseAuth: {
            idToken: string;
            refreshToken: string;
            localID: string;
        };
    }
}
