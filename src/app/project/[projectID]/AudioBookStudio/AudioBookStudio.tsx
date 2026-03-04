"use client";

import { useAudioBookForTextToSpeech } from "@/hooks/useAudioBookForTextToSpeech";
import { useParams } from "next/navigation";
import AudioBookGen from "../AudioBookGen/AudioBookGen";

export default function AudioBookStudio() {
    const { projectID }: { projectID: string } = useParams<{ projectID: string }>();
    const audioBookState = useAudioBookForTextToSpeech(projectID);

    if (audioBookState.state === "pending") {
        return "Loading...";
    }

    if (audioBookState.state === "error") {
        return "ERROR: AudioBook not found!";
    }

    return <AudioBookGen audioBookSuccessState={audioBookState} />;
}
