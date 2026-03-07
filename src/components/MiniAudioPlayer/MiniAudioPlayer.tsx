"use client";

import { AsyncStateType } from "@/app/types/AsyncState";
import { getGlobalAudioContext } from "@/utils/audio/getGlobalAudioContext";
import { PeaksAudioPlayerAdapter } from "@/utils/audio/PeaksAudioPlayerAdapter";
import { Download, ExternalLink, Pause, Play } from "lucide-react";
import Peaks, { PeaksInstance, PeaksOptions } from "peaks.js";
import { useState, useRef, useEffect, useCallback, useId } from "react";
import { Button } from "../ui/button";
import { pcmFloat32ToWAV } from "@/utils/audio/pcmFloat32ToWAV";

export type AudioPlayerAdapterResourceStateType = AsyncStateType<PeaksAudioPlayerAdapter>;

export default function MiniAudioPlayer({
    audioPlayerResourceState,
    downloadFileNameWithoutExtension,
    // title,
    // audioPlayerAdapter,
    // subtitle = "Default voice preview",
    // onDownload,
    // onShare,
}: {
    downloadFileNameWithoutExtension?: string;
    audioPlayerResourceState: AudioPlayerAdapterResourceStateType;
}) {
    if (!downloadFileNameWithoutExtension) {
        downloadFileNameWithoutExtension = crypto.randomUUID();
    }

    const [playing, setPlaying] = useState(() => {
        if (audioPlayerResourceState.status === "SUCCESS") {
            return audioPlayerResourceState.data.isPlaying();
        }

        return false;
    });

    const togglePlayPause = useCallback(() => {
        (async function () {
            if (audioPlayerResourceState.status === "SUCCESS") {
                await audioPlayerResourceState.data.togglePlayPause();
                setPlaying(audioPlayerResourceState.data.isPlaying());
            }
        })();
    }, [setPlaying, audioPlayerResourceState]);

    const download = useCallback(() => {
        if (audioPlayerResourceState.status !== "SUCCESS") {
            return;
        }

        const audioBuffer = audioPlayerResourceState.data.getAudioBuffer();
        const wav = pcmFloat32ToWAV(audioBuffer);
        const blob = new Blob([wav], { type: "audio/wav" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `${downloadFileNameWithoutExtension}.wav`;
        a.click();
    }, [audioPlayerResourceState, downloadFileNameWithoutExtension]);

    if (audioPlayerResourceState.status === "PENDING") {
        return "Loading...";
    }

    if (audioPlayerResourceState.status === "ERROR") {
        return "Error...";
    }

    return (
        <div className="flex items-center gap-4 border-border border rounded-md px-4">
            <Button variant="wrapper" size="wrapper" className="p-0" onClick={togglePlayPause}>
                {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
            </Button>
            <AudioWaveform audioPlayerAdapter={audioPlayerResourceState.data} />
            <Button variant="wrapper" size="wrapper" className="p-0" onClick={download}>
                <Download className="size-4" />
            </Button>
            <ExternalLink className="size-4" />
        </div>
    );
}

function AudioWaveform({ audioPlayerAdapter }: { audioPlayerAdapter: PeaksAudioPlayerAdapter }) {
    const [, setPeaksInstance] = useState<PeaksInstance | null>(null);
    const overviewContainerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        (async function () {
            if (!overviewContainerRef.current) {
                return;
            }

            const options: PeaksOptions = {
                axisTopMarkerHeight: 0,
                axisBottomMarkerHeight: 0,

                overview: {
                    waveformColor: "rgba(201, 223, 138, 1)", // #c9df8a with full opacity
                    playedWaveformColor: "rgba(119, 171, 89, 1)", // #77ab59 with full opacity
                    playheadWidth: 0,
                    container: overviewContainerRef.current,
                    showAxisLabels: false,
                },
                webAudio: {
                    audioContext: getGlobalAudioContext(),
                    audioBuffer: audioPlayerAdapter.getAudioBuffer(),
                },
                player: audioPlayerAdapter,
            };

            Peaks.init(options, (error, instance) => {
                if (!instance) {
                    console.error("Peaks init error:", error);
                    return;
                }

                setPeaksInstance(instance);
            });
        })();
    }, [setPeaksInstance, audioPlayerAdapter]);

    return <div ref={overviewContainerRef} className="peaks_overview_container h-16 w-72"></div>;
}
