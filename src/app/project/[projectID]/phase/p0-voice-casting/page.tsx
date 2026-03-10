"use client";

import { useAudioBookForVoiceCastingPhase } from "@/hooks/useAudioBookForVoiceCastingPhase";
import { useParams } from "next/navigation";
import VoiceCasting from "./index";
import { useHeaderStore } from "@/hooks/useHeaderStore";
import { useEffect } from "react";

export default function Page() {
    const setText = useHeaderStore((state) => state.setText);
    const resetText = useHeaderStore((state) => state.resetText);

    useEffect(() => {
        setText("PHASE 0: VOICE CASTING");

        return () => {
            resetText();
        };
    });

    const { projectID }: { projectID: string } = useParams<{ projectID: string }>();
    const { audioBookState, syncStatus } = useAudioBookForVoiceCastingPhase(projectID);

    if (audioBookState.state === "pending") {
        return "Loading...";
    }

    if (audioBookState.state === "error") {
        return "ERROR: AudioBook not found!";
    }

    return <VoiceCasting audioBookSuccessState={audioBookState} {...{ syncStatus }} />;
}
