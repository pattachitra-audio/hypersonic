"use client";

import { useAudioBookForTextToSpeech } from "@/hooks/useAudioBookForTextToSpeech";
import { useParams } from "next/navigation";
import DialogueSynthesis from "./index";
import { useEffect } from "react";
import { useHeaderStore } from "@/hooks/useHeaderStore";

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
    const audioBookState = useAudioBookForTextToSpeech(projectID);

    if (audioBookState.state === "pending") {
        return "Loading...";
    }

    if (audioBookState.state === "error") {
        return "ERROR: AudioBook not found!";
    }

    return <DialogueSynthesis audioBookSuccessState={audioBookState} />;
}
