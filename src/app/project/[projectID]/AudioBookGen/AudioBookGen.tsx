import { useState } from "react";
// import P0VoiceCasting from "../phase/p0-voice-casting/P0VoiceCasting";
import P1DialogueSynthesis from "./phases/P1DialogueSynthesis";
import P2Assembly from "./phases/P2Assembly";
import { AudioBookSuccessStateType } from "@/hooks/useAudioBookForTextToSpeech";

export default function AudioBookGen({ audioBookSuccessState }: { audioBookSuccessState: AudioBookSuccessStateType }) {
    const [phase, setPhase] = useState<0 | 1 | 2>(0);

    function nextPhase() {
        setPhase((phase) => {
            if (phase === 0) {
                return 1;
            } else if (phase === 1) {
                return 2;
            }

            return 2;
        });
    }

    function previousPhase() {
        setPhase((phase) => {
            if (phase === 2) {
                return 1;
            } else if (phase === 1) {
                return 0;
            }

            return 0;
        });
    }

    if (phase === 0) {
        return <P0VoiceCasting {...{ nextPhase, audioBookSuccessState }} />;
    } else if (phase === 1) {
        return <P1DialogueSynthesis {...{ nextPhase, audioBookSuccessState, previousPhase }} />;
    } else {
        return <P2Assembly {...{ previousPhase }} />;
    }
}
