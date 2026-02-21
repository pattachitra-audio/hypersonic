import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
    Character,
    ElevenLabsTextToSpeechVoiceSettings,
    ElevenLabsTextToSpeechVoiceSettingsDefaultValue,
} from "@/schemas/Character";

export default function VoiceSettings({
    character,
    onSettingsChange,
}: {
    character: Character;
    onSettingsChange: <
        T extends keyof ElevenLabsTextToSpeechVoiceSettings,
        V extends ElevenLabsTextToSpeechVoiceSettings[T],
    >(
        key: T,
        value: V,
    ) => void;
}) {
    let disabled = false;

    if (!character.voice) {
        disabled = true;
    }

    const nonNullSettings =
        character.voice?.voiceSettings?.textToSpeech ?? ElevenLabsTextToSpeechVoiceSettingsDefaultValue;

    return (
        <>
            <div className="h-px bg-border" />

            <div className="space-y-5">
                <Speed
                    {...{ disabled }}
                    speed={nonNullSettings.speed}
                    onChange={(value) => onSettingsChange("speed", value)}
                />
                <Stability
                    {...{ disabled }}
                    stability={nonNullSettings.stability}
                    onChange={(value) => onSettingsChange("stability", value)}
                />
                <SimilarityBoost
                    {...{ disabled }}
                    similarityBoost={nonNullSettings.similarityBoost}
                    onChange={(value) => onSettingsChange("similarityBoost", value)}
                />
                <StyleExaggeration
                    {...{ disabled }}
                    style={nonNullSettings.style}
                    onChange={(value) => onSettingsChange("style", value)}
                />
                <SpeakerBoost
                    {...{ disabled }}
                    speakerBoost={nonNullSettings.speakerBoost}
                    onChange={(value) => onSettingsChange("speakerBoost", value)}
                />
            </div>
        </>
    );
}

function Speed({ speed, disabled, onChange }: { speed: number; disabled: boolean; onChange: (value: number) => void }) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Speed</label>
                <Badge variant="secondary" className="font-mono text-xs">
                    {speed.toFixed(2)}x
                </Badge>
            </div>
            <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-12">Slower</span>
                <Slider
                    {...{ disabled }}
                    value={[speed]}
                    min={0.5}
                    max={2}
                    step={0.01}
                    onValueChange={([value]) => onChange(value)}
                    className="flex-1"
                />
                <span className="text-xs text-muted-foreground w-12 text-right">Faster</span>
            </div>
        </div>
    );
}

function Stability({
    stability,
    disabled,
    onChange,
}: {
    stability: number;
    disabled: boolean;
    onChange: (value: number) => void;
}) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Stability</label>
                <Badge variant="secondary" className="font-mono text-xs">
                    {Math.round(stability * 100)}%
                </Badge>
            </div>
            <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-12">Variable</span>
                <Slider
                    {...{ disabled }}
                    value={[stability]}
                    min={0}
                    max={1}
                    step={0.01}
                    onValueChange={([value]) => onChange(value)}
                    className="flex-1"
                />
                <span className="text-xs text-muted-foreground w-12 text-right">Stable</span>
            </div>
        </div>
    );
}

function SimilarityBoost({
    similarityBoost,
    disabled,
    onChange,
}: {
    similarityBoost: number;
    disabled: boolean;
    onChange: (value: number) => void;
}) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Similarity</label>
                <Badge variant="secondary" className="font-mono text-xs">
                    {Math.round(similarityBoost * 100)}%
                </Badge>
            </div>
            <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-12">Low</span>
                <Slider
                    {...{ disabled }}
                    value={[similarityBoost]}
                    min={0}
                    max={1}
                    step={0.01}
                    onValueChange={([value]) => onChange(value)}
                    className="flex-1"
                />
                <span className="text-xs text-muted-foreground w-12 text-right">High</span>
            </div>
        </div>
    );
}

function StyleExaggeration({
    style,
    disabled,
    onChange,
}: {
    style: number;
    disabled: boolean;
    onChange: (value: number) => void;
}) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Style Exaggeration</label>
                <Badge variant="secondary" className="font-mono text-xs">
                    {Math.round(style * 100)}%
                </Badge>
            </div>
            <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-12">None</span>
                <Slider
                    {...{ disabled }}
                    value={[style]}
                    min={0}
                    max={1}
                    step={0.01}
                    onValueChange={([value]) => onChange(value)}
                    className="flex-1"
                />
                <span className="text-xs text-muted-foreground w-12 text-right">Max</span>
            </div>
        </div>
    );
}

function SpeakerBoost({
    speakerBoost,
    onChange,
    disabled,
}: {
    speakerBoost: boolean;
    disabled: boolean;
    onChange: (value: boolean) => void;
}) {
    return (
        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
            <label className="text-sm font-medium">Speaker Boost</label>
            <Switch {...{ disabled }} checked={speakerBoost} onCheckedChange={(checked) => onChange(checked)} />
        </div>
    );
}
