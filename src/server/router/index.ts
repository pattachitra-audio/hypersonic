import { tRPCRouter } from "@/server/tRPC";
import { projectRouter } from "./project";
import { projectsRouter } from "./projects";
import { elevenLabsAccountWithProxyRouter } from "./elevenLabsAccountWithProxy";

export const router = tRPCRouter({
    project: projectRouter,
    projects: projectsRouter,
    elevenLabsAccountWithProxy: elevenLabsAccountWithProxyRouter,
});

export type Router = typeof router;
