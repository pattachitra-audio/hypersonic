"use client";

import { useState } from "react";
import { Plus, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/project-card";
import { CreateNewProjectModal } from "@/app/CreateNewProjectModal";
import { OpenProjectModal } from "@/components/open-project-modal";

const recentProjects = [
    { id: "1", name: "The Great Gatsby", lastOpened: "2 days ago" },
    { id: "2", name: "Pride and Prejudice", lastOpened: "1 week ago" },
    { id: "3", name: "Moby Dick", lastOpened: "2 weeks ago" },
    { id: "4", name: "Jane Eyre", lastOpened: "3 weeks ago" },
    { id: "5", name: "Wuthering Heights", lastOpened: "1 month ago" },
    { id: "6", name: "The Odyssey", lastOpened: "2 months ago" },
];

export function Dashboard() {
    const [createNewProjectModalWindowIsOpen, setCreateNewProjetModalWindowIsOpen] = useState(false);
    const [openProjectOpen, setOpenProjectOpen] = useState(false);

    return (
        <main className="flex-1 overflow-auto p-6 pt-20 md:p-8 md:pt-20">
            <div className="mx-auto max-w-6xl">
                {/* Action Buttons */}
                <div className="mb-8 flex flex-wrap gap-3">
                    <Button
                        onClick={() => setCreateNewProjetModalWindowIsOpen(true)}
                        className="gap-2 transition-all hover:scale-105 active:scale-95"
                    >
                        <Plus className="h-4 w-4" />
                        Create New Project
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setOpenProjectOpen(true)}
                        className="gap-2 transition-all hover:scale-105 active:scale-95"
                    >
                        <FolderOpen className="h-4 w-4" />
                        Open Project
                    </Button>
                </div>

                {/* Recent Projects */}
                <section>
                    <h2 className="mb-6 text-xl font-semibold">Recently Opened</h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {recentProjects.map((project) => (
                            <ProjectCard
                                key={project.id}
                                name={project.name}
                                lastOpened={project.lastOpened}
                                onOpen={() => console.log("Opening:", project.name)}
                            />
                        ))}
                    </div>
                </section>
            </div>

            {/* Modals */}
            <CreateNewProjectModal
                isOpen={createNewProjectModalWindowIsOpen}
                onOpenChange={setCreateNewProjetModalWindowIsOpen}
            />
            <OpenProjectModal open={openProjectOpen} onOpenChange={setOpenProjectOpen} />
        </main>
    );
}
