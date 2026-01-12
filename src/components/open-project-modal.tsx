"use client";

import { useState, useMemo } from "react";
import { Search, Folder, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface Project {
    id: string;
    name: string;
    lastOpened: string;
}

const allProjects: Project[] = [
    { id: "1", name: "The Great Gatsby", lastOpened: "2 days ago" },
    { id: "2", name: "Pride and Prejudice", lastOpened: "1 week ago" },
    { id: "3", name: "Moby Dick", lastOpened: "2 weeks ago" },
    { id: "4", name: "Jane Eyre", lastOpened: "3 weeks ago" },
    { id: "5", name: "Wuthering Heights", lastOpened: "1 month ago" },
    { id: "6", name: "The Odyssey", lastOpened: "2 months ago" },
    { id: "7", name: "To Kill a Mockingbird", lastOpened: "3 months ago" },
    { id: "8", name: "1984", lastOpened: "4 months ago" },
];

interface OpenProjectModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function OpenProjectModal({ open, onOpenChange }: OpenProjectModalProps) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredProjects = useMemo(() => {
        if (!searchQuery.trim()) return allProjects;
        return allProjects.filter((project) => project.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [searchQuery]);

    const handleSelectProject = (project: Project) => {
        console.log("Opening project:", project);
        setSearchQuery("");
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Open Project</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search projects..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 transition-all focus:ring-2 focus:ring-primary/20"
                            autoFocus
                        />
                    </div>
                    <div className="max-h-[320px] space-y-1 overflow-y-auto pr-1">
                        {filteredProjects.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <Folder className="mb-2 h-10 w-10 text-muted-foreground/50" />
                                <p className="text-sm text-muted-foreground">No projects found</p>
                            </div>
                        ) : (
                            filteredProjects.map((project) => (
                                <button
                                    key={project.id}
                                    onClick={() => handleSelectProject(project)}
                                    className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition-all hover:bg-muted/80 active:scale-[0.99]"
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                        <Folder className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium">{project.name}</p>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Clock className="h-3 w-3" />
                                            {project.lastOpened}
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
