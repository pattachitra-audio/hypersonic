import type { TestProject } from "vitest/node";
import { setupFirebaseAuth } from "./helpers/setupFirebaseAuth";

export async function setup(testProject: TestProject) {
    const result = await setupFirebaseAuth();

    if (result.isErr()) {
        throw result.error;
    }

    console.log("Setup firebase auth ✔");

    testProject.provide("firebaseAuth", result.value);
}
