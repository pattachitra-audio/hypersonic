import type { TestProject } from "vitest/node";
import { setupFirebaseAuth } from "./helpers/setupFirebaseAuth";

export function setup(testProject: TestProject) {
    return setupFirebaseAuth().map((firebaseAuth) => testProject.provide("firebaseAuth", firebaseAuth));
}
