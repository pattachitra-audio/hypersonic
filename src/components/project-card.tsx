"use client";

import { Folder, ExternalLink, Clock, MoreHorizontal, Trash2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProjectCardProps {
    name: string;
    lastOpened: string;
    onOpen: () => void;
}

export function ProjectCard({ name, lastOpened, onOpen }: ProjectCardProps) {
    return (
        <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 cursor-pointer border-border/50 hover:border-primary/30">
            <div className="absolute inset-0 z-10" onClick={onOpen} />

            <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 transition-all duration-300 group-hover:scale-110 group-hover:from-primary/30 group-hover:to-primary/10">
                        <Folder className="h-6 w-6 text-primary" />
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 relative z-20 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={onOpen}>
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Open Project
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Copy className="mr-2 h-4 w-4" />
                                Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="space-y-1">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{lastOpened}</span>
                    </div>
                </div>

                <Button
                    variant="secondary"
                    size="sm"
                    className="w-full mt-4 relative z-20 bg-primary/10 hover:bg-primary hover:text-primary-foreground transition-all duration-200 font-medium"
                    onClick={(e) => {
                        e.stopPropagation();
                        onOpen();
                    }}
                >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open Project
                </Button>
            </CardContent>
        </Card>
    );
}
