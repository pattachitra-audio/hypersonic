"use client";

import { Menu, Github, Palette } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/components/ui/sidebar";

const themes = [
    { id: "light", label: "Light", color: "#ffffff" },
    { id: "dark", label: "Dark", color: "#1a1a1a" },
    { id: "ocean", label: "Ocean", color: "#0ea5e9" },
    { id: "forest", label: "Forest", color: "#22c55e" },
    { id: "sunset", label: "Sunset", color: "#f97316" },
];

export function Header() {
    const { setTheme, theme } = useTheme();
    const { toggleSidebar } = useSidebar();

    return (
        <header className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                    className="transition-transform hover:scale-105 active:scale-95"
                >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle sidebar</span>
                </Button>
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                        <span className="text-sm font-bold text-primary-foreground">H</span>
                    </div>
                    <span className="text-xl font-bold tracking-tight">HYPERSONIC</span>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="transition-transform hover:scale-105 active:scale-95"
                >
                    <a href="https://github.com/pattachitraaudio/hypersonic" target="_blank" rel="noopener noreferrer">
                        <Github className="h-5 w-5" />
                        <span className="sr-only">GitHub Repository</span>
                    </a>
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 transition-transform hover:scale-105 active:scale-95 bg-transparent"
                        >
                            <Palette className="h-4 w-4" />
                            <span className="hidden sm:inline">Theme</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Choose Theme</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {themes.map((t) => (
                            <DropdownMenuItem
                                key={t.id}
                                onClick={() => setTheme(t.id)}
                                className="gap-3 cursor-pointer"
                            >
                                <div
                                    className="h-4 w-4 rounded-full border border-border"
                                    style={{ backgroundColor: t.color }}
                                />
                                <span>{t.label}</span>
                                {theme === t.id && <span className="ml-auto text-xs text-primary">✓</span>}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
