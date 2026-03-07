import { AudioBook } from "@/schemas/AudioBook";
import Scene from "./Scene";

export default function Episode({ audioBook, index }: { audioBook: AudioBook; index: number }) {
    const episode = audioBook.episodes[index];
    const scenes = audioBook.scenes.slice(episode.sceneBegin, episode.sceneEnd);

    return (
        <article className="flex-1">
            {scenes.map((_, index) => (
                <Scene key={index} {...{ audioBook, index }} />
            ))}
        </article>
    );
}
