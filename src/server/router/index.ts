import { tRPCRouter } from "@/server/tRPC";
import { projectRouter } from "./project";
import { projectsRouter } from "./projects";
import { elevenLabsAccountWithProxyRouter } from "./elevenLabsAccountWithProxy";
import { praoSessionRouter } from "./praoSession";
import { elevenLabsInternalRouter } from "./elevenLabsInternal";

export const router = tRPCRouter({
    project: projectRouter,
    projects: projectsRouter,
    elevenLabsAccountWithProxy: elevenLabsAccountWithProxyRouter,
    praoSession: praoSessionRouter,
    elevenLabsInternalRouter: elevenLabsInternalRouter,
});

export type Router = typeof router;
