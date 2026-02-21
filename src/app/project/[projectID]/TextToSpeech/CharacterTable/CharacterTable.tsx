"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, User, MessageSquare, Mic2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SelectedCharacter } from "@/app/types/SelectedCharacter";
import { AudioBook } from "@/schemas/AudioBook";

export default function CharacterTable({
    audioBook,
    selectedCharacter,
    onSelectCharacter,
}: {
    audioBook: AudioBook;
    selectedCharacter: SelectedCharacter | null;
    onSelectCharacter(index: number): void;
}) {
    return (
        <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableHead className="w-50 ml-3 align-center font-semibold">Character</TableHead>
                        <TableHead className="w-25 text-center font-semibold">Gender</TableHead>
                        <TableHead className="w-20 text-center font-semibold">Age</TableHead>
                        <TableHead className="font-semibold">Voice Description</TableHead>
                        <TableHead className="w-37.5 font-semibold">
                            <Mic2 className="h-5 w-5 text-primary inline" /> Voice
                        </TableHead>
                        <TableHead className="w-25 text-center font-semibold">Dialogues</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {audioBook.characters.map((character, index) => {
                        const isSelected = selectedCharacter !== null && selectedCharacter.index === index;
                        const numberDialogues = audioBook.dialogues.filter(({ character: c }) => c === index).length;
                        return (
                            <TableRow
                                key={index}
                                className={cn(
                                    "cursor-pointer transition-all duration-200 group",
                                    isSelected ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/50",
                                )}
                                style={{
                                    animationDelay: `${index * 50}ms`,
                                }}
                                onClick={() => onSelectCharacter(index)}
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
                                <TableCell className="text-center">
                                    <span className="text-muted-foreground">{character.gender}</span>
                                </TableCell>
                                <TableCell className="text-center">
                                    <span className="text-muted-foreground">
                                        {character.ageGroup[0]} - {character.ageGroup[1]}
                                    </span>
                                </TableCell>
                                <TableCell className="text-muted-foreground max-w-75">
                                    <span className="truncate block">{character.voiceDescription}</span>
                                </TableCell>
                                <TableCell>
                                    {character.voice != null ? (
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-5 h-5 rounded-full shrink-0 ring-2 ring-background shadow-sm"
                                                style={{
                                                    background: `linear-gradient(135deg, red 0%, blue 100%)`,
                                                }}
                                            />
                                            <Badge variant="secondary" className="font-medium">
                                                {character.voice.name ?? "null"}
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
                                        <span className="font-medium">{numberDialogues}</span>
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
