import Sidebar from "./Sidebar";
import Main from "./Main";
import type { AudioBookTypeForDialogueSynthesisPhase } from "@/hooks/useAudioBookForDialogueSynthesisPhase";

export default function DialogueSynthesis({ audioBook }: { audioBook: AudioBookTypeForDialogueSynthesisPhase }) {
    return (
        <div className="flex h-full w-full overflow-hidden">
            <Sidebar {...{ audioBook }} />
            <Main {...{ audioBook }} />
        </div>
    );
}
