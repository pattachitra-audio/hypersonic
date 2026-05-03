"use client";

import { useAudioBookForDialogueSynthesisPhase } from "@/hooks/useAudioBookForDialogueSynthesisPhase";
import { useParams } from "next/navigation";
import DialogueSynthesis from "./index";
import { useEffect } from "react";
import { useHeaderStore } from "@/hooks/useHeaderStore";
import { getErrorMessage } from "@/utils/getErrorMessage";

export default function AudioBookStudio() {
    const setText = useHeaderStore((state) => state.setText);
    const resetText = useHeaderStore((state) => state.resetText);

    useEffect(() => {
        setText("PHASE 1: DIALOGUE SYNTHESIS");

        return () => {
            resetText();
        };
    });

    const { projectID }: { projectID: string } = useParams<{ projectID: string }>();
    const { audioBookState } = useAudioBookForDialogueSynthesisPhase(projectID);

    if (audioBookState.status === "pending") {
        return "Loading...";
    }

    if (audioBookState.status === "error") {
        return `${getErrorMessage(audioBookState.error)}`;
    }

    return <DialogueSynthesis audioBook={audioBookState.data} />;
}
