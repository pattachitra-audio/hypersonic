import { router } from "@/server/router";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

const handler = (req: Request) =>
    fetchRequestHandler({
        endpoint: "/api/tRPC",
        req,
        router,
        createContext: () => ({}),
    });

export { handler as GET, handler as POST };
