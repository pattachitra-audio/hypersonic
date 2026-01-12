"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, User, MessageSquare } from "lucide-react";
import type { Character } from "@/lib/types";
import { cn } from "@/lib/utils";
import { voices } from "@/lib/voices";

interface CharacterTableProps {
    characters: Character[];
    selectedCharacterId: number | null;
    onSelectCharacter: (character: Character) => void;
}

export function CharacterTable({ characters, selectedCharacterId, onSelectCharacter }: CharacterTableProps) {
    return (
        <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableHead className="w-[200px] font-semibold">Character</TableHead>
                        <TableHead className="w-[100px] font-semibold">Gender</TableHead>
                        <TableHead className="w-[80px] font-semibold">Age</TableHead>
                        <TableHead className="font-semibold">Voice Description</TableHead>
                        <TableHead className="w-[150px] font-semibold">Voice</TableHead>
                        <TableHead className="w-[100px] text-center font-semibold">Dialogues</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {characters.map((character, index) => {
                        const selectedVoice = voices.find((v) => v.id === character.voiceId);
                        const isSelected = selectedCharacterId === character.id;

                        return (
                            <TableRow
                                key={character.id}
                                className={cn(
                                    "cursor-pointer transition-all duration-200 group",
                                    isSelected ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/50",
                                )}
                                style={{
                                    animationDelay: `${index * 50}ms`,
                                }}
                                onClick={() => onSelectCharacter(character)}
                            >
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={cn(
                                                "w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200",
                                                isSelected
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-muted group-hover:bg-muted-foreground/10",
                                            )}
                                        >
                                            <User className="h-4 w-4" />
                                        </div>
                                        <span className="font-medium">{character.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-muted-foreground">{character.gender}</span>
                                </TableCell>
                                <TableCell>
                                    <span className="text-muted-foreground">
                                        {character.ageRange[0]}-{character.ageRange[1]}
                                    </span>
                                </TableCell>
                                <TableCell className="text-muted-foreground max-w-[300px]">
                                    <span className="line-clamp-1">{character.voiceDescription}</span>
                                </TableCell>
                                <TableCell>
                                    {selectedVoice ? (
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-5 h-5 rounded-full flex-shrink-0 ring-2 ring-background shadow-sm"
                                                style={{
                                                    background: `linear-gradient(135deg, ${selectedVoice.color} 0%, ${selectedVoice.colorEnd} 100%)`,
                                                }}
                                            />
                                            <Badge variant="secondary" className="font-medium">
                                                {selectedVoice.name}
                                            </Badge>
                                        </div>
                                    ) : (
                                        <Badge
                                            variant="outline"
                                            className="text-orange-600 border-orange-200 bg-orange-50 dark:bg-orange-950/30 dark:border-orange-800 gap-1.5 animate-pulse"
                                        >
                                            <AlertCircle className="h-3 w-3" />
                                            Not assigned
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex items-center justify-center gap-1.5">
                                        <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span className="font-medium">{character.dialogueCount}</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
