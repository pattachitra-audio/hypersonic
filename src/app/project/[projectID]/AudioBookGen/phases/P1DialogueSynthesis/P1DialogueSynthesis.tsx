import Sidebar from "./Sidebar";
import { AudioBookSuccessStateType } from "@/hooks/useAudioBookForTextToSpeech";

export default function P1DialogueSynthesis({
    audioBookSuccessState,
}: {
    audioBookSuccessState: AudioBookSuccessStateType;
}) {
    return (
        <>
            <Sidebar audioBook={audioBookSuccessState.audioBook} />
        </>
    );
}
