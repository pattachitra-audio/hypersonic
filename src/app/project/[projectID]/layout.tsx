import { TypeScriptRPCProvider } from "@/app/tRPCProvider";

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
    return <TypeScriptRPCProvider>{children}</TypeScriptRPCProvider>;
}
