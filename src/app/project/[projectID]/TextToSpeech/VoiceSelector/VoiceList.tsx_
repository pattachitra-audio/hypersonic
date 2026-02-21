import { ScrollArea } from "@/components/ui/scroll-area";
import { VoiceItem } from "./VoiceItem";
import { VoiceResponse } from "@/ext/elevenLabsAPI/voices/listVoices/response";

export function VoiceList({
    voices,
    playingID,
    setPlayingId,
    selectedID,
    setSelectedId,
}: {
    voices: VoiceResponse[];
    playingID: string | null;
    setPlayingID: (id: string | null) => void;
    selectedID: string | null;
    setSelectedID: (id: string | null) => void;
}) {
    return (
        <ScrollArea className="flex-1">
            <div className="px-2 py-1">
                {voices.map((voice) => (
                    <VoiceItem
                        key={voice.voiceID}
                        voice={voice}
                        isPlaying={playingID === voice.voiceID}
                        isSelected={selectedID === voice.voiceID}
                        onPlayToggle={() => setPlayingId(playingId === voice.id ? null : voice.id)}
                        onSelect={() => setSelectedId(selectedID === voice.voiceID ? null : voice.voiceID)}
                    />
                ))}
            </div>
        </ScrollArea>
    );
}
