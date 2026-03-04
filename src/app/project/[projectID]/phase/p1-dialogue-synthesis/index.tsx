import Sidebar from "./Sidebar";
import MainContent from "./MainContent";
import { AudioBookSuccessStateType } from "@/hooks/useAudioBookForTextToSpeech";

export default function DialogueSynthesis({
    audioBookSuccessState,
}: {
    audioBookSuccessState: AudioBookSuccessStateType;
}) {
    return (
        <div className="flex h-full w-full overflow-hidden">
            <Sidebar audioBook={audioBookSuccessState.audioBook} />
            <MainContent audioBook={audioBookSuccessState.audioBook} />
        </div>
    );
}
