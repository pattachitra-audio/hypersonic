"use client";

import { useState } from "react";
import { Plus, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import AudioBookProjectCard from "./AudioBookProjectCard";
import NewProjectModal from "@/app/NewProjectModal";
import OpenProjectModal from "@/app/OpenProjectModal";
import { tRPC } from "@/utils/tRPC";
import { Separator } from "@/components/ui/separator";

export default function Dashboard() {
    const [newProjectModalWindowOpen, setNewProjetModalWindowOpen] = useState(false);
    const [openProjectModalWindowOpen, setOpenProjectModalWindowOpen] = useState(false);

    return (
        <main className="flex-1 overflow-auto p-6 pt-20 md:p-8 md:pt-20">
            <div className="mx-auto max-w-6xl">
                <div className="mb-8 flex flex-wrap gap-3">
                    <Button
                        onClick={() => setNewProjetModalWindowOpen(true)}
                        className="gap-2 transition-all hover:scale-105 active:scale-95"
                    >
                        <Plus className="h-4 w-4" />
                        Create new project
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setOpenProjectModalWindowOpen(true)}
                        className="gap-2 transition-all hover:scale-105 active:scale-95"
                    >
                        <FolderOpen className="h-4 w-4" />
                        Open project
                    </Button>
                </div>
                <RecentProjects />
            </div>
            <NewProjectModal open={newProjectModalWindowOpen} updateOpen={setNewProjetModalWindowOpen} />
            <OpenProjectModal open={openProjectModalWindowOpen} updateOpen={setOpenProjectModalWindowOpen} />
        </main>
    );
}

function RecentProjects() {
    const query = tRPC.projects.get.useQuery();

    if (query.isPending) {
        return "Loading...";
    }

    if (query.isError) {
        return "Error!";
    }

    const audioBookSummaries = query.data;

    return (
        <section className="mt-8">
            <h2 className="mb-1 text-xl font-semibold">Recently opened</h2>
            <Separator />
            <div className="mt-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {audioBookSummaries.length === 0 && "No projects found!"}
                {audioBookSummaries.map((audioBookSummary) => (
                    <AudioBookProjectCard key={audioBookSummary.id} {...{ audioBookSummary }} />
                ))}
            </div>
        </section>
    );
}
