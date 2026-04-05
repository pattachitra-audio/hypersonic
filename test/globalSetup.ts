import type { TestProject } from "vitest/node";
import { setupFirebaseAuth } from "./helpers/setupFirebaseAuth";

function fn(testProject: TestProject) {
    return setupFirebaseAuth().map((firebaseAuth) => testProject.provide("firebaseAuth", firebaseAuth));
}

export async function setup(testProject: TestProject) {
    const result = await fn(testProject);

    if (result.isErr()) {
        throw result.error;
    }
}
