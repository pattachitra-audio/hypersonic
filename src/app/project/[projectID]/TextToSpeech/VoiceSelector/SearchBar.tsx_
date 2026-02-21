import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Search, Settings } from "lucide-react";
import { VoiceSelectorSearchSettings } from "./VoiceSelectorSearchSettings";

export function SearchBar({ searchSettings }: { searchSettings: VoiceSelectorSearchSettings }) {
    return (
        <div className="relative flex items-center gap-2">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Start typing to search..."
                    value={settings.searchQuery}
                    onChange={(e) => updateSetting("searchQuery", e.target.value)}
                    className="h-10 rounded-lg border-muted bg-muted/50 pl-10 pr-4 transition-all placeholder:text-muted-foreground/70 focus:bg-background focus:shadow-sm"
                />
            </div>
            {/* Settings Gear Button */}
            <Popover open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn("size-10 shrink-0 rounded-lg", activeSettingsCount > 0 && "text-foreground")}
                    >
                        <Settings className="size-5" />
                        {activeSettingsCount > 0 && (
                            <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-foreground text-[10px] font-medium text-background">
                                {activeSettingsCount}
                            </span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 max-h-[60vh] overflow-y-auto p-0" align="end" side="bottom">
                    <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-popover px-4 py-3">
                        <h4 className="font-medium text-sm">Search Settings</h4>
                        {activeSettingsCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    updateSetting("sort", null);
                                    updateSetting("sortDirection", null);
                                    updateSetting("includeTotalCount", null);
                                    updateSetting("collectionID", null);
                                    updateSetting("voiceIDs", null);
                                    updateSetting("pageSize", 20);
                                }}
                                className="h-auto px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                            >
                                Reset
                            </Button>
                        )}
                    </div>

                    <div className="space-y-4 p-4">
                        {/* Page Size */}
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-muted-foreground">Results per page</Label>
                            <div className="flex gap-1.5">
                                {[10, 20, 50, 100].map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => updateSetting("pageSize", size)}
                                        className={cn(
                                            "flex-1 rounded-md border py-1.5 text-xs font-medium transition-all",
                                            settings.pageSize === size
                                                ? "border-foreground bg-foreground text-background"
                                                : "border-border hover:border-foreground/50",
                                        )}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Separator />

                        {/* Sort */}
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-muted-foreground">Sort By</Label>
                                <Select
                                    value={settings.sort || "none"}
                                    onValueChange={(v) =>
                                        updateSetting("sort", v === "none" ? null : (v as "CREATED_AT" | "NAME"))
                                    }
                                >
                                    <SelectTrigger className="h-8 rounded-md text-xs">
                                        <SelectValue placeholder="None" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        <SelectItem value="CREATED_AT">Date Created</SelectItem>
                                        <SelectItem value="NAME">Name</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-muted-foreground">Direction</Label>
                                <Select
                                    value={settings.sortDirection || "none"}
                                    onValueChange={(v) =>
                                        updateSetting(
                                            "sortDirection",
                                            v === "none" ? null : (v as "ASCENDING" | "DESCENDING"),
                                        )
                                    }
                                >
                                    <SelectTrigger className="h-8 rounded-md text-xs">
                                        <SelectValue placeholder="None" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        <SelectItem value="ASCENDING">Ascending</SelectItem>
                                        <SelectItem value="DESCENDING">Descending</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Separator />

                        {/* Include Total Count */}
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-medium">Include Total Count</Label>
                            <Switch
                                checked={settings.includeTotalCount === true}
                                onCheckedChange={(checked) => updateSetting("includeTotalCount", checked ? true : null)}
                            />
                        </div>

                        <Separator />

                        {/* Collection ID */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-muted-foreground">Collection ID</Label>
                            <Input
                                placeholder="Enter collection ID..."
                                value={settings.collectionID || ""}
                                onChange={(e) => updateSetting("collectionID", e.target.value || null)}
                                className="h-8 rounded-md text-xs"
                            />
                        </div>

                        {/* Voice IDs */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-muted-foreground">Voice IDs</Label>
                            <Input
                                placeholder="id1, id2, id3..."
                                value={settings.voiceIDs?.join(", ") || ""}
                                onChange={(e) =>
                                    updateSetting(
                                        "voiceIDs",
                                        e.target.value ? e.target.value.split(",").map((id) => id.trim()) : null,
                                    )
                                }
                                className="h-8 rounded-md text-xs"
                            />
                            <p className="text-[10px] text-muted-foreground">Separate multiple IDs with commas</p>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}

function SearchSettings() {}
