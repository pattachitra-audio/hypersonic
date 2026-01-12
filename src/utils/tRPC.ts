import { createTRPCReact } from "@trpc/react-query";
import type { Router } from "@/server/router";

export const tRPC = createTRPCReact<Router>();
