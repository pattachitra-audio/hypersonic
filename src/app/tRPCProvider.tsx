"use client";

import { tRPC } from "@/utils/tRPC";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { useState } from "react";

export function TypeScriptRPCProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());
    const [tRPCClient] = useState(() =>
        tRPC.createClient({
            links: [
                httpBatchLink({
                    url: "/api/tRPC",
                }),
            ],
        }),
    );

    return (
        <tRPC.Provider client={tRPCClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </tRPC.Provider>
    );
}
