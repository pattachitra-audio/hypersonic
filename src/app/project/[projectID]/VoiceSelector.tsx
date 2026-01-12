"use client";

import type React from "react";

import { useState } from "react";
import { Search, Play, Pause, MoreHorizontal, Check, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { voices, type Voice } from "@/lib/voices";
import { cn } from "@/lib/utils";

interface VoiceSelectorProps {
    selectedVoiceId: string | null;
    onSelectVoice: (voiceId: string) => void;
}

export function VoiceSelector({ selectedVoiceId, onSelectVoice }: VoiceSelectorProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
    const [isDefaultOpen, setIsDefaultOpen] = useState(true);
    const [isProfessionalOpen, setIsProfessionalOpen] = useState(true);

    const filteredVoices = voices.filter(
        (voice) =>
            voice.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            voice.description.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const defaultVoices = filteredVoices.slice(0, 6);
    const professionalVoices = filteredVoices.slice(6);
    const recentlyUsed = selectedVoiceId ? voices.filter((v) => v.id === selectedVoiceId) : [];

    const handlePlayVoice = (voiceId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (playingVoiceId === voiceId) {
            setPlayingVoiceId(null);
        } else {
            setPlayingVoiceId(voiceId);
            setTimeout(() => setPlayingVoiceId(null), 2000);
        }
    };

    const isSearching = searchQuery.length > 0;

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
                {!isSearching && (
                    <button className="flex items-center justify-between w-full p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-2">
                            <Heart className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">All saved voices</span>
                        </div>
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </button>
                )}
            </div>

            {/* Scrollable Voice List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isSearching ? (
                    <div className="space-y-1">
                        {filteredVoices.map((voice) => (
                            <VoiceItem
                                key={voice.id}
                                voice={voice}
                                isSelected={selectedVoiceId === voice.id}
                                isPlaying={playingVoiceId === voice.id}
                                onSelect={() => onSelectVoice(voice.id)}
                                onPlay={(e) => handlePlayVoice(voice.id, e)}
                            />
                        ))}
                        {filteredVoices.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-8">No voices found</p>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Recently Used */}
                        {recentlyUsed.length > 0 && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">Recently used</span>
                                    <button className="text-xs text-primary hover:underline">View all</button>
                                </div>
                                {recentlyUsed.map((voice) => (
                                    <VoiceItem
                                        key={voice.id}
                                        voice={voice}
                                        isSelected={selectedVoiceId === voice.id}
                                        isPlaying={playingVoiceId === voice.id}
                                        onSelect={() => onSelectVoice(voice.id)}
                                        onPlay={(e) => handlePlayVoice(voice.id, e)}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Default Voices */}
                        <Collapsible open={isDefaultOpen} onOpenChange={setIsDefaultOpen}>
                            <div className="flex items-center justify-between">
                                <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                                    Default
                                    <ChevronDown
                                        className={cn(
                                            "h-4 w-4 transition-transform duration-200",
                                            isDefaultOpen && "rotate-180",
                                        )}
                                    />
                                </CollapsibleTrigger>
                                <button className="text-xs text-primary hover:underline">View all</button>
                            </div>
                            <CollapsibleContent className="space-y-1 pt-2 animate-in slide-in-from-top-2 duration-200">
                                {defaultVoices.map((voice) => (
                                    <VoiceItem
                                        key={voice.id}
                                        voice={voice}
                                        isSelected={selectedVoiceId === voice.id}
                                        isPlaying={playingVoiceId === voice.id}
                                        onSelect={() => onSelectVoice(voice.id)}
                                        onPlay={(e) => handlePlayVoice(voice.id, e)}
                                    />
                                ))}
                            </CollapsibleContent>
                        </Collapsible>

                        {/* Professional Voices */}
                        <Collapsible open={isProfessionalOpen} onOpenChange={setIsProfessionalOpen}>
                            <div className="flex items-center justify-between">
                                <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                                    Professional
                                    <ChevronDown
                                        className={cn(
                                            "h-4 w-4 transition-transform duration-200",
                                            isProfessionalOpen && "rotate-180",
                                        )}
                                    />
                                </CollapsibleTrigger>
                                <button className="text-xs text-primary hover:underline">View all</button>
                            </div>
                            <CollapsibleContent className="space-y-1 pt-2 animate-in slide-in-from-top-2 duration-200">
                                {professionalVoices.map((voice) => (
                                    <VoiceItem
                                        key={voice.id}
                                        voice={voice}
                                        isSelected={selectedVoiceId === voice.id}
                                        isPlaying={playingVoiceId === voice.id}
                                        onSelect={() => onSelectVoice(voice.id)}
                                        onPlay={(e) => handlePlayVoice(voice.id, e)}
                                    />
                                ))}
                            </CollapsibleContent>
                        </Collapsible>
                    </>
                )}
            </div>
        </div>
    );
}

interface VoiceItemProps {
    voice: Voice;
    isSelected: boolean;
    isPlaying: boolean;
    onSelect: () => void;
    onPlay: (e: React.MouseEvent) => void;
}

function VoiceItem({ voice, isSelected, isPlaying, onSelect, onPlay }: VoiceItemProps) {
    return (
        <div
            onClick={onSelect}
            className={cn(
                "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200",
                "hover:bg-muted/50",
                isSelected && "bg-muted",
            )}
        >
            {/* Voice Avatar */}
            <div className="relative shrink-0">
                <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{
                        background: `linear-gradient(135deg, ${voice.color} 0%, ${voice.colorEnd} 100%)`,
                    }}
                />
            </div>

            {/* Voice Info */}
            <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                    {voice.name} - {voice.style}
                </p>
                <p className="text-xs text-muted-foreground truncate">{voice.description}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0">
                {isSelected && <Check className="h-4 w-4 text-foreground mr-1" />}
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onPlay}>
                    {isPlaying ? <Pause className="h-4 w-4 animate-pulse" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
