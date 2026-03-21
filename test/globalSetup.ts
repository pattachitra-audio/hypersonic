import type { TestProject } from "vitest/node";
import { setupFirebaseAuth } from "./helpers/setupFirebaseAuth";

export async function setup(testProject: TestProject) {
    const firebaseAuthResult = await setupFirebaseAuth();

    if (firebaseAuthResult.isErr()) {
        throw firebaseAuthResult.error;
    }

    console.log("Setup firebase auth ✔");
    testProject.provide("firebaseAuth", firebaseAuthResult.value);
}
