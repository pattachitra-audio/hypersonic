import { Button } from "@/components/ui/button";
import { VOICE_SELECTOR_SETTINGS_ENUMS, VoiceSelectorSearchSettings } from "./VoiceSelectorSearchSettings";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dispatch, SetStateAction } from "react";
import { produce } from "immer";

export function FilterSection({
    voiceSelectorSearchSettings,
    setVoiceSelectorSearchSettings,
}: {
    voiceSelectorSearchSettings: VoiceSelectorSearchSettings;
    setVoiceSelectorSearchSettings: Dispatch<SetStateAction<VoiceSelectorSearchSettings>>;
}) {
    const { voiceType, category, fineTuning } = voiceSelectorSearchSettings;

    const updateSetting = <
        Key extends keyof VoiceSelectorSearchSettings,
        Value extends VoiceSelectorSearchSettings[Key],
    >(
        key: Key,
        value: Value,
    ) => {
        setVoiceSelectorSearchSettings((settings) =>
            produce(settings, (draft) => {
                draft[key] = value;
            }),
        );
    };

    const updateVoiceTypeSettings = (voiceType: VoiceType): void => {
        updateSetting("voiceType", voiceType);
    };

    const updateCategoryFilterSettings = (category: CategoryType): void => {
        updateSetting("category", category);
    };

    const updateFineTuningFilter = (fineTuning: FineTuningType): void => {
        updateSetting("fineTuning", fineTuning);
    };

    const clearAllFilters = (): void => {
        updateVoiceTypeSettings(null);
        updateCategoryFilterSettings(null);
        updateFineTuningFilter(null);
    };

    const filterIsActive = voiceType !== null || category !== null || fineTuning !== null;

    return (
        <div className="flex items-center gap-2 flex-wrap">
            <VoiceTypeFilter {...{ voiceType }} updateSetting={updateVoiceTypeSettings} />
            <CategoryFilter {...{ category }} updateSetting={updateCategoryFilterSettings} />
            <FineTuningFilter {...{ fineTuning }} updateSetting={updateFineTuningFilter} />

            {filterIsActive && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                    Clear
                </Button>
            )}
        </div>
    );
}

function prettifyEnum(screamingSnakeCaseString: string) {
    if (screamingSnakeCaseString.length === 0) {
        return "$Not available$";
    }

    screamingSnakeCaseString = screamingSnakeCaseString[0] + screamingSnakeCaseString.slice(1);
    screamingSnakeCaseString.replaceAll("_", " ");
}

type VoiceType = VoiceSelectorSearchSettings["voiceType"];

function VoiceTypeFilter({
    voiceType,
    updateSetting,
}: {
    voiceType: VoiceType;
    updateSetting: (voiceType: VoiceType) => void;
}) {
    const prettifyVoiceTypeEnum = (voiceType: NonNullable<VoiceType>) => {
        return prettifyEnum(voiceType);
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                        "h-7 gap-1 rounded-full border-dashed px-2.5 text-xs transition-all hover:border-solid",
                        voiceType &&
                            "border-solid border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
                    )}
                >
                    <Plus className="size-3" />
                    {voiceType ? prettifyVoiceTypeEnum(voiceType) : "Voice type"}
                    {voiceType && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                updateSetting(null);
                            }}
                            className="ml-0.5 rounded-full hover:bg-emerald-200 dark:hover:bg-emerald-800"
                        >
                            <X className="size-3" />
                        </button>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2" align="start">
                <div className="space-y-1">
                    {VOICE_SELECTOR_SETTINGS_ENUMS.VOICE_TYPE.map((elem) => (
                        <button
                            key={elem}
                            onClick={() => {
                                updateSetting(elem);
                            }}
                            className={cn(
                                "w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors",
                                voiceType === elem ? "bg-foreground text-background" : "hover:bg-muted",
                            )}
                        >
                            {prettifyVoiceTypeEnum(elem)}
                        </button>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
}

type CategoryType = VoiceSelectorSearchSettings["category"];

function CategoryFilter({
    category,
    updateSetting,
}: {
    category: CategoryType;
    updateSetting: (category: CategoryType) => void;
}) {
    const prettifyCategoryEnum = (category: NonNullable<CategoryType>) => {
        return prettifyEnum(category);
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                        "h-7 gap-1 rounded-full border-dashed px-2.5 text-xs transition-all hover:border-solid",
                        category &&
                            "border-solid border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300",
                    )}
                >
                    <Plus className="size-3" />
                    {category ? prettifyCategoryEnum(category) : "Category"}
                    {category && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                updateSetting(null);
                            }}
                            className="ml-0.5 rounded-full hover:bg-amber-200 dark:hover:bg-amber-800"
                        >
                            <X className="size-3" />
                        </button>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-2" align="start">
                <div className="space-y-1">
                    {VOICE_SELECTOR_SETTINGS_ENUMS.CATEGORY.map((elem) => (
                        <button
                            key={elem}
                            onClick={() => {
                                updateSetting(elem);
                            }}
                            className={cn(
                                "w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors",
                                category === elem ? "bg-foreground text-background" : "hover:bg-muted",
                            )}
                        >
                            {prettifyCategoryEnum(elem)}
                        </button>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
}

type FineTuningType = VoiceSelectorSearchSettings["fineTuning"];

function FineTuningFilter({
    fineTuning,
    updateSetting,
}: {
    fineTuning: FineTuningType;
    updateSetting: (fineTuning: FineTuningType) => void;
}) {
    const prettifyFineTuningEnum = (fineTuning: NonNullable<FineTuningType>) => {
        return prettifyEnum(fineTuning);
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                        "h-7 gap-1 rounded-full border-dashed px-2.5 text-xs transition-all hover:border-solid",
                        fineTuning &&
                            "border-solid border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300",
                    )}
                >
                    <Plus className="size-3" />
                    {fineTuning ? prettifyFineTuningEnum(fineTuning) : "Fine tuning"}
                    {fineTuning && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                updateSetting(null);
                            }}
                            className="ml-0.5 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800"
                        >
                            <X className="size-3" />
                        </button>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-2" align="start">
                <div className="space-y-1">
                    {VOICE_SELECTOR_SETTINGS_ENUMS.FINE_TUNING.map((elem) => (
                        <button
                            key={elem}
                            onClick={() => {
                                updateSetting(elem);
                            }}
                            className={cn(
                                "w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors",
                                fineTuning === elem ? "bg-foreground text-background" : "hover:bg-muted",
                            )}
                        >
                            {prettifyFineTuningEnum(elem)}
                        </button>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
}
