import Sidebar from "./Sidebar";
import Main from "./Main";
import { AudioBookWithCharacterVoicesSuccessAsyncStateType } from "@/hooks/useAudioBookForDialogueSynthesisPhase";

export default function DialogueSynthesis({
    audioBookWithCharacterVoicesSuccessState,
}: {
    audioBookWithCharacterVoicesSuccessState: AudioBookWithCharacterVoicesSuccessAsyncStateType;
}) {
    return (
        <div className="flex h-full w-full overflow-hidden">
            <Sidebar audioBookWithCharacterVoices={audioBookWithCharacterVoicesSuccessState.data} />
            <Main audioBookWithCharacterVoices={audioBookWithCharacterVoicesSuccessState.data} />
        </div>
    );
}
