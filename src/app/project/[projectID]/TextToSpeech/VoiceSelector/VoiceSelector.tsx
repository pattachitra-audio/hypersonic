"use client";

import type React from "react";
import z from "zod";

import {
    ArrowLeft,
    Search,
    SlidersHorizontal,
    AudioWaveform,
    Play,
    Pause,
    MoreHorizontal,
    ArrowUpDown,
    X,
    ChevronDown,
    Link2,
    Copy,
    History,
    Check,
    Heart,
} from "lucide-react";
import { ChangeEvent, InputEvent, useState } from "react";
import {} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { CharacterVoice } from "@/schemas/Character";
import { useQuery } from "@tanstack/react-query";
import { listVoices } from "@/ext/elevenLabsAPI/voices";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface VoiceSelectorProps {
    onSelectVoice: (voice: CharacterVoice) => void;
}

export default function VoiceSelector({ onSelectVoice }: VoiceSelectorProps) {
    /*
    const [searchQuery, setSearchQuery] = useState("");

    const [pageSize, setPageSize] = useState(10);
    const [sortBy, setSortBy] = useState<"name" | "createdAt" | null>();
    const [sortDir, setSortDir] = useState<"ascending" | "descending" | null>();
    const [voiceType, setVoiceType] = useState<
    */

    const [searchSettings, setSearchSettings] = useState<VoiceSelectorSearchSettings>(
        VoiceSelectorSearchSettingsSchema.parse({}),
    );

    // const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
    // const [isDefaultOpen, setIsDefaultOpen] = useState(true);
    // const [isProfessionalOpen, setIsProfessionalOpen] = useState(true);

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["voices"],
        queryFn: () => listVoices({ search: searchQuery, pageSize: 20 }),
    });

    const searchQueryOnChange = (e: ChangeEvent<HTMLInputElement>) => {
        // const
    };
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

    return (
        <div className="flex flex-col h-full">
            {/* Fixed Header with Search */}
            <div className="p-4 space-y-3 border-b bg-card shrink-0">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search voices..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
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
            </div>
        </div>
    );
}

function isValidVoiceID(voiceID: string) {
    if (voiceID.length !== 20) {
        return false;
    }

    return true;
}

import { Settings, Plus } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { VoiceList } from "./VoiceList";
import { FilterSection } from "./FilterSection";
import {
    VoiceSelectorSearchSettings,
    VoiceSelectorSearchSettingsSchema,
    VoiceSelectorSettings,
} from "./VoiceSelectorSearchSettings";
import { SearchBar } from "./SearchBar";

interface Voice {
    id: string;
    name: string;
    description: string;
    gradientFrom: string;
    gradientTo: string;
    accentColor: string;
    isProfessional: boolean;
}

type PlayingType = {
    id: string;
};
export function VoiceSearchSidebar() {
    const [settings, setSettings] = useState<VoiceSelectorSettings>(defaultSettings);
    const [activeTab, setActiveTab] = useState("explore");
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const [playingID, setPlayingID] = useState<string | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const updateSetting = <K extends keyof VoiceSelectorSettings>(key: K, value: VoiceSelectorSettings[K]) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
    };

    const clearAllFilters = () => {
        setSettings(defaultSettings);
    };

    // Count active filters (voiceType, category, fineTuning)
    const activeFilterCount = [settings.voiceType, settings.category, settings.fineTuning].filter(
        (v) => v !== null,
    ).length;

    // Count active settings (sort, pageSize changes, etc)
    const activeSettingsCount = [
        settings.sort,
        settings.sortDirection,
        settings.includeTotalCount,
        settings.collectionID,
        settings.voiceIDs,
    ].filter((v) => v !== null && v !== "").length;

    const filteredVoices = mockVoices.filter((voice) =>
        voice.name.toLowerCase().includes(settings.searchQuery.toLowerCase()),
    );

    return (
        <div className="flex h-screen w-85 flex-col border-l bg-background shadow-xl">
            {/* Header */}
            <div className="flex items-center gap-3 border-b px-4 py-3">
                <Button variant="ghost" size="icon" className="size-7 rounded-md hover:bg-muted">
                    <ArrowLeft className="size-4" />
                </Button>
                <h2 className="flex-1 font-medium">Select a voice</h2>
            </div>

            <div className="space-y-3 px-4 pt-4 pb-2">
                <SearchBar />

                <FilterSection
                    settings={settings}
                    updateSetting={updateSetting}
                    clearAllFilters={clearAllFilters}
                    activeFilterCount={activeFilterCount}
                    activeSettingsCount={activeSettingsCount}
                    isFilterOpen={isFilterOpen}
                    setIsFilterOpen={setIsFilterOpen}
                    isSettingsOpen={isSettingsOpen}
                    setIsSettingsOpen={setIsSettingsOpen}
                />
            </div>

            <VoiceList
                voices={filteredVoices}
                playingId={playingId}
                setPlayingId={setPlayingId}
                selectedId={selectedId}
                setSelectedId={setSelectedId}
            />
        </div>
    );
}

{
    /* Tabs */
}
{
    /*<Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-1 flex-col">
                <div className="border-b px-2">
                    <TabsList className="h-11 w-full bg-transparent p-0 gap-1">
                        <TabsTrigger
                            value="explore"
                            className="flex-1 gap-1.5 rounded-none border-b-2 border-transparent px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all data-[state=active]:border-foreground data-[state=active]:text-foreground data-[state=active]:shadow-none"
                        >
                            <AudioWaveform className="size-4" />
                            Explore
                        </TabsTrigger>
                        <TabsTrigger
                            value="my-voices"
                            className="flex-1 rounded-none border-b-2 border-transparent px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all data-[state=active]:border-foreground data-[state=active]:text-foreground data-[state=active]:shadow-none"
                        >
                            My Voices
                        </TabsTrigger>
                        <TabsTrigger
                            value="default"
                            className="flex-1 rounded-none border-b-2 border-transparent px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all data-[state=active]:border-foreground data-[state=active]:text-foreground data-[state=active]:shadow-none"
                        >
                            Default
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="explore" className="mt-0 flex flex-1 flex-col p-0">
                </TabsContent>

                <TabsContent value="my-voices" className="mt-0 flex flex-1 flex-col p-0">
                    <FilterSection
                        settings={settings}
                        updateSetting={updateSetting}
                        clearAllFilters={clearAllFilters}
                        activeFilterCount={activeFilterCount}
                        activeSettingsCount={activeSettingsCount}
                        isFilterOpen={isFilterOpen}
                        setIsFilterOpen={setIsFilterOpen}
                        isSettingsOpen={isSettingsOpen}
                        setIsSettingsOpen={setIsSettingsOpen}
                    />
                    <VoiceList
                        voices={filteredVoices.slice(0, 4)}
                        playingId={playingId}
                        setPlayingId={setPlayingId}
                        selectedId={selectedId}
                        setSelectedId={setSelectedId}
                    />
                </TabsContent>

                <TabsContent value="default" className="mt-0 flex flex-1 flex-col p-0">
                    <FilterSection
                        settings={settings}
                        updateSetting={updateSetting}
                        clearAllFilters={clearAllFilters}
                        activeFilterCount={activeFilterCount}
                        activeSettingsCount={activeSettingsCount}
                        isFilterOpen={isFilterOpen}
                        setIsFilterOpen={setIsFilterOpen}
                        isSettingsOpen={isSettingsOpen}
                        setIsSettingsOpen={setIsSettingsOpen}
                    />
                    <VoiceList
                        voices={filteredVoices.slice(0, 2)}
                        playingId={playingId}
                        setPlayingId={setPlayingId}
                        selectedId={selectedId}
                        setSelectedId={setSelectedId}
                    />
                </TabsContent>
            </Tabs> */
}
