import { AudioBookWithCharacterVoices } from "@/schemas/AudioBook";
import Scene from "./Scene";

export default function Episode({
    audioBookWithCharacterVoices,
    index,
}: {
    audioBookWithCharacterVoices: AudioBookWithCharacterVoices;
    index: number;
}) {
    const episode = audioBookWithCharacterVoices.episodes[index];
    const scenes = audioBookWithCharacterVoices.scenes.slice(episode.sceneBegin, episode.sceneEnd);

    return (
        <article className="flex-1">
            {scenes.map((_, i) => (
                <Scene key={i} audioBookWithCharacterVoices={audioBookWithCharacterVoices} index={episode.sceneBegin + i} />
            ))}
        </article>
    );
}
