"use client";

import { Separator } from "@/components/ui/separator";
import { MoreHorizontal, Play, Search } from "lucide-react";
import { useState } from "react";
import {} from "lucide-react";
import { Input } from "@/components/ui/input";
import { CharacterVoice, ElevenLabsTextToSpeechVoiceSettingsSchema } from "@/schemas/Character";
import { useQuery } from "@tanstack/react-query";
import { listVoicesQuery } from "@/queries/elevenLabsAPI/voices/listVoices";
import { VoiceResponse } from "@/queries/elevenLabsAPI/voices/listVoices/response";
import { VoiceSelectorSearchSettings, VoiceSelectorSearchSettingsDefaultValue } from "./VoiceSelectorSearchSettings";
import { useDebounce } from "@/hooks/useDebounce";
import { INVALID_INDEX } from "@/constants";
import { undefinedToNull } from "@/utils/undefinedToNull";

export default function VoiceSelector({ onSelectVoice }: { onSelectVoice: (voice: CharacterVoice) => void }) {
    const [searchSettings, setSearchSettings] = useState<VoiceSelectorSearchSettings>(
        VoiceSelectorSearchSettingsDefaultValue,
    );

    function updateSearchSetting<Key extends keyof VoiceSelectorSearchSettings>(
        key: Key,
        value: VoiceSelectorSearchSettings[Key],
    ) {
        setSearchSettings((v) => ({
            ...v,
            [key]: value,
        }));
    }

    // const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
    // const [isDefaultOpen, setIsDefaultOpen] = useState(true);
    // const [isProfessionalOpen, setIsProfessionalOpen] = useState(true);

    // console.log("searchQuery", searchSettings.searchQuery);
    const searchQueryDebounced = useDebounce(searchSettings.searchQuery, 600);
    // console.log("searchQueryDebouned", searchQueryDebounced);

    const searchQueryValue = searchQueryDebounced.toLowerCase().split(" ").join("+");

    const queryResult = useQuery({
        queryKey: ["elevenLabs/listVoicesQuery", searchQueryValue],
        queryFn: () => listVoicesQuery({ search: searchQueryValue, pageSize: 50 }),
    });

    /*
    const filteredVoices = voices.filter(
        (voice) =>
            voice.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            voice.description.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    */

    // const defaultVoices = filteredVoices.slice(0, 6);
    // const professionalVoices = filteredVoices.slice(6);
    // const recentlyUsed = selectedVoiceId ? voices.filter((v) => v.id === selectedVoiceId) : [];

    /*
    function handleSearch() {
        const modifiedSearchQuery = searchQuery;
        await elevenLabsRouter.voices.listVoices({ input: {} });
    }
        */

    /*
    const handlePlayVoice = (voiceId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (playingVoiceId === voiceId) {
            setPlayingVoiceId(null);
        } else {
            setPlayingVoiceId(voiceId);
            setTimeout(() => setPlayingVoiceId(null), 2000);
        }
    };
    */

    // const isSearching = searchQuery.length > 0;
    // console.log("SearchQuery:", searchSettings.searchQuery);
    // console.log("queryResult", queryResult, queryResult.error);

    return (
        <div className="flex flex-col h-full">
            {/* Fixed Header with Search */}
            <div className="px-4 pt-4 flex flex-col h-full space-y-3 bg-card shrink-0">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search voices..."
                        value={searchSettings.searchQuery}
                        onChange={({ target: { value } }) => updateSearchSetting("searchQuery", value)}
                        className="pl-9"
                    />
                </div>
                {/* All saved voices dropdown - only show when not searching */}
                {/*{!isSearching && (
                    <button className="flex items-center justify-between w-full p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-2">
                            <Heart className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">All saved voices</span>
                        </div>
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </button>
                )} */}

                <Separator />
                {queryResult.isPending ? (
                    <VoiceSearchLoading />
                ) : queryResult.isError ? (
                    (console.log(queryResult.error), (<VoiceSearchError />))
                ) : (
                    <VoiceSearchResults onSelectVoice={onSelectVoice} voices={queryResult.data.voices} />
                )}
            </div>
        </div>
    );
}

function VoiceSearchLoading() {
    return <p>Loading...</p>;
}

function VoiceSearchError() {
    return <p>Error...</p>;
}

function VoiceSearchResults({
    voices,
    onSelectVoice,
}: {
    voices: VoiceResponse[];
    onSelectVoice: (voice: CharacterVoice) => void;
}) {
    const [playingIndex, setPlayingIndex] = useState(INVALID_INDEX);

    return (
        <div className="flex-1 overflow-y-auto pb-4 pretty-scrollbar">
            <ul>
                {voices.map((voice, index) => (
                    <Voice
                        isPlaying={playingIndex === index}
                        key={index}
                        voice={voice}
                        onPlay={() => setPlayingIndex(index)}
                        onPause={() => setPlayingIndex(INVALID_INDEX)}
                        onClick={() =>
                            onSelectVoice({
                                provider: "ELEVENLABS",
                                voiceID: voice.voiceID,
                                name: voice.name,
                                gender: voice.gender,
                                description: undefinedToNull(voice.description),
                                verifiedLanguages: voice.verifiedLanguages,
                                category: voice.category,
                                /* voiceSettings: {
                                    textToSpeech: ElevenLabsTextToSpeechVoiceSettingsSchema.parse({
                                        applyTextNormalization: "off",
                                        applyLanguageTextNormalization: false,
                                        ...voice.settings,
                                    }),
                                },*/
                            })
                        }
                    />
                ))}
            </ul>
        </div>
    );
}

function Voice({
    isPlaying,
    voice,
    onClick,
}: {
    isPlaying: boolean;
    voice: VoiceResponse;
    onPlay: () => void;
    onPause: () => void;
    onClick: () => void;
}) {
    // const hue = getVoiceHue(voice.name);
    const hue = "80";

    return (
        <li
            onClick={onClick}
            className="relative flex items-center gap-3 py-1.5 px-2.5 rounded-2xl hover:bg-muted/50 cursor-pointer group"
        >
            {/* Orb avatar with badge */}
            <div className="relative shrink-0 w-8 h-8">
                <div
                    className="w-full h-full rounded-full bg-linear-to-br from-cyan-400 to-blue-600"
                    style={{ filter: `hue-rotate(${hue}deg) saturate(120%)`, transform: `rotate(${hue}deg)` }}
                />
                <VerifiedBadge className="absolute -top-1 -right-1 w-4 h-4" />
            </div>

            {/* Name + description */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{voice.name}</p>
                <p className="text-sm text-muted-foreground line-clamp-1">{voice.description || "No description"}</p>
            </div>

            {/* Actions */}
            <button
                aria-label="Play preview"
                onClick={(e) => e.stopPropagation()}
                className="shrink-0 w-8 h-8 inline-flex items-center justify-center rounded-lg hover:bg-muted/80"
            >
                <Play className="w-4 h-4" fill="currentColor" />
            </button>
            <button
                aria-label="More actions"
                onClick={(e) => e.stopPropagation()}
                className="shrink-0 w-8 h-8 inline-flex items-center justify-center rounded-lg hover:bg-muted/80"
            >
                <MoreHorizontal className="w-4 h-4" />
            </button>
        </li>
    );
}

// Extract the badge SVG into its own component to keep Voice clean
function VerifiedBadge({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 20 20" fill="none" className={className}>
            <path
                className="fill-background"
                fillRule="evenodd"
                d="m13.02 2.944 1.664-.02a2.5 2.5 0 0 1 2.53 2.53l-.02 1.663 1.19 1.163a2.5 2.5 0 0 1 0 3.577l-1.19 1.163.02 1.664a2.5 2.5 0 0 1-2.53 2.53l-1.664-.02-1.163 1.19a2.5 2.5 0 0 1-3.577 0l-1.163-1.19-1.663.02a2.5 2.5 0 0 1-2.53-2.53l.02-1.664-1.19-1.163a2.5 2.5 0 0 1 0-3.577l1.19-1.163-.02-1.663a2.5 2.5 0 0 1 2.53-2.53l1.663.02 1.163-1.19a2.5 2.5 0 0 1 3.577 0l1.163 1.19Z"
                clipRule="evenodd"
            />
            <path
                fill="#DDBF22"
                fillRule="evenodd"
                d="M12.755 4.378a1 1 0 0 1-.727-.302l-1.313-1.343a1 1 0 0 0-1.43 0L7.972 4.076a1 1 0 0 1-.727.302l-1.878-.023a1 1 0 0 0-1.012 1.012l.023 1.878a1 1 0 0 1-.302.728L2.733 9.284a1 1 0 0 0 0 1.43l1.343 1.313a1 1 0 0 1 .302.727l-.023 1.878a1 1 0 0 0 1.012 1.012l1.878-.023a1 1 0 0 1 .728.302l1.312 1.343a1 1 0 0 0 1.43 0l1.313-1.343a1 1 0 0 1 .727-.302l1.878.023a1 1 0 0 0 1.012-1.012l-.023-1.878a1 1 0 0 1 .302-.727l1.343-1.313a1 1 0 0 0 0-1.43l-1.343-1.313a1 1 0 0 1-.302-.727l.023-1.878a1 1 0 0 0-1.012-1.012l-1.878.023Z"
                clipRule="evenodd"
            />
            <path
                className="fill-background"
                fillRule="evenodd"
                d="m13.53 8.53-1.06-1.06L9 10.94 7.53 9.47l-1.06 1.06L9 13.06l4.53-4.53Z"
                clipRule="evenodd"
            />
        </svg>
    );
}

/**
Type '{ stability?: number | null | undefined; style?: number | null | undefined; speed?: number | null | undefined; useSpeakerBoost: boolean | null | undefined; similarityBoost: number | null | undefined; } | null | undefined' is not assignable to type '{ stability: number; speakerBoost: boolean; similarityBoost: number; style: number; speed: number; applyTextNormalization: "auto" | "on" | "off"; applyLanguageTextNormalization: boolean; } | null | undefined'.
  Type '{ stability?: number | null | undefined; style?: number | null | undefined; speed?: number | null | undefined; useSpeakerBoost: boolean | null | undefined; similarityBoost: number | null | undefined; }' is missing the following properties from type '{ stability: number; speakerBoost: boolean; similarityBoost: number; style: number; speed: number; applyTextNormalization: "auto" | "on" | "off"; applyLanguageTextNormalization: boolean; }': speakerBoost, applyTextNormalization, applyLanguageTextNormalization
 */
