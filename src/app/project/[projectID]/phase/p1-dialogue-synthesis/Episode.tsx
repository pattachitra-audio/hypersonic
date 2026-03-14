import { AudioBookWithCharacterVoices } from "@/schemas/AudioBook";
import Scene from "./Scene";
import { Separator } from "@/components/ui/separator";

export default function Episode({
    audioBookWithCharacterVoices,
    index,
}: {
    audioBookWithCharacterVoices: AudioBookWithCharacterVoices;
    index: number;
}) {
    const episode = audioBookWithCharacterVoices.episodes[index];
    const scenes = audioBookWithCharacterVoices.scenes.slice(episode.sceneBegin, episode.sceneEnd);
    const isFirst = index === 0;

    return (
        <article id={`episode-${index}`} className="flex-1">
            {!isFirst && <Separator />}

            {/* Episode header */}
            <div className="px-8 py-8">
                <p className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase mb-1">
                    Episode {index + 1}
                </p>
                <h2 className="text-2xl font-bold text-foreground mb-2">{episode.name}</h2>
                {episode.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-prose">{episode.description}</p>
                )}
            </div>

            <Separator />

            {scenes.map((_, i) => (
                <Scene key={i} audioBookWithCharacterVoices={audioBookWithCharacterVoices} index={episode.sceneBegin + i} />
            ))}
        </article>
    );
}
