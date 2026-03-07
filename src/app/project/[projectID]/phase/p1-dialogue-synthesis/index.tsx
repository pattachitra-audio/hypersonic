import Sidebar from "./Sidebar";
import Main from "./Main";
import { AudioBookSuccessStateType } from "@/hooks/useAudioBookForTextToSpeech";

export default function DialogueSynthesis({
    audioBookSuccessState,
}: {
    audioBookSuccessState: AudioBookSuccessStateType;
}) {
    return (
        <div className="flex h-full w-full overflow-hidden">
            <Sidebar audioBook={audioBookSuccessState.audioBook} />
            <Main audioBook={audioBookSuccessState.audioBook} />
        </div>
    );
}
