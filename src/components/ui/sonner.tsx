"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

function useThemeLightDarkSystem(): "light" | "dark" | "system" {
    const { theme } = useTheme();

    if (theme === "light") {
        return "light";
    }

    if (theme === "dark") {
        return "dark";
    }

    return "system";
}
const Toaster = ({ ...props }: ToasterProps) => {
    return (
        <Sonner
            theme={useThemeLightDarkSystem()}
            className="toaster group"
            style={
                {
                    "--normal-bg": "var(--popover)",
                    "--normal-text": "var(--popover-foreground)",
                    "--normal-border": "var(--border)",
                } as React.CSSProperties
            }
            {...props}
        />
    );
};

export { Toaster };
