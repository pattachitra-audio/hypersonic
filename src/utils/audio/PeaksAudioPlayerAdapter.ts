import type { EventEmitterForPlayerEvents, PlayerAdapter } from "peaks.js";
import debug from "debug";
import type { Debugger } from "debug";
import { getGlobalAudioContext } from "./getGlobalAudioContext";

export class PeaksAudioPlayerAdapter implements PlayerAdapter {
    private htmlAudioElem: HTMLAudioElement;
    private audioBuffer: AudioBuffer;
    private static logger: Debugger = (() => {
        const logger = debug("{PeaksAudioPlayerAdapter}");
        // debug.enable("{PeaksAudioPlayerAdapter}");
        return logger;
    })();

    private constructor(audioBlobSrc: string, audioBuffer: AudioBuffer) {
        PeaksAudioPlayerAdapter.logger("constructor() called");
        this.audioBuffer = audioBuffer;
        this.htmlAudioElem = new Audio(audioBlobSrc);
    }

    static async fromArrayBuffer(arrayBuffer: ArrayBuffer): Promise<PeaksAudioPlayerAdapter> {
        const blob = new Blob([arrayBuffer], { type: "audio/mpeg" });
        const blobURL = URL.createObjectURL(blob);
        const audioBuffer = await getGlobalAudioContext().decodeAudioData(arrayBuffer);

        return new PeaksAudioPlayerAdapter(blobURL, audioBuffer);
    }

    getAudioBuffer() {
        return this.audioBuffer;
    }

    async init(eventEmitter: EventEmitterForPlayerEvents): Promise<void> {
        PeaksAudioPlayerAdapter.logger("init() called");

        const loaded = new Promise<void>((resolve, reject) => {
            this.htmlAudioElem.addEventListener("loadeddata", () => resolve());
            this.htmlAudioElem.addEventListener("error", () => reject());
        });

        this.htmlAudioElem.addEventListener("ended", () => {
            PeaksAudioPlayerAdapter.logger("ended event");
            eventEmitter.emit("player.ended");
        });

        this.htmlAudioElem.addEventListener("error", () => {
            PeaksAudioPlayerAdapter.logger("error event", this.htmlAudioElem.error);
            eventEmitter.emit("player.error", this.htmlAudioElem.error);
        });

        this.htmlAudioElem.addEventListener("pause", () => {
            PeaksAudioPlayerAdapter.logger("pause event, currentTime:", this.htmlAudioElem.currentTime);
            eventEmitter.emit("player.pause", this.htmlAudioElem.currentTime);
        });

        this.htmlAudioElem.addEventListener("playing", () => {
            PeaksAudioPlayerAdapter.logger("playing event, currentTime:", this.htmlAudioElem.currentTime);
            eventEmitter.emit("player.playing", this.htmlAudioElem.currentTime);
        });

        this.htmlAudioElem.addEventListener("seeked", () => {
            PeaksAudioPlayerAdapter.logger("seeked event, currentTime:", this.htmlAudioElem.currentTime);
            eventEmitter.emit("player.seeked", this.htmlAudioElem.currentTime);
        });

        this.htmlAudioElem.addEventListener("timeupdate", () => {
            PeaksAudioPlayerAdapter.logger("timeupdate event, currentTime:", this.htmlAudioElem.currentTime);
            eventEmitter.emit("player.timeupdate", this.htmlAudioElem.currentTime);
        });

        await loaded;
    }

    destroy(): void {
        PeaksAudioPlayerAdapter.logger("destroy() called");

        this.htmlAudioElem.pause();
        this.htmlAudioElem.src = "";
        this.htmlAudioElem.load();
    }

    play(): Promise<void> {
        PeaksAudioPlayerAdapter.logger("play() called");
        return this.htmlAudioElem.play();
    }

    pause(): void {
        PeaksAudioPlayerAdapter.logger("pause() called");
        this.htmlAudioElem.pause();
    }

    async togglePlayPause(): Promise<void> {
        if (this.isPlaying()) {
            this.pause();
        } else {
            this.play();
        }
    }

    isPlaying(): boolean {
        const playing = !this.htmlAudioElem.paused;
        PeaksAudioPlayerAdapter.logger("isPlaying() called, returning:", playing);
        return playing;
    }

    isSeeking(): boolean {
        const seeking = this.htmlAudioElem.seeking;
        PeaksAudioPlayerAdapter.logger("isSeeking() called, returning:", seeking);
        return seeking;
    }

    getCurrentTime(): number {
        const time = this.htmlAudioElem.currentTime;
        PeaksAudioPlayerAdapter.logger("getCurrentTime() called, returning:", time);
        return time;
    }

    getDuration(): number {
        PeaksAudioPlayerAdapter.logger("getDuration() called, returning:", this.htmlAudioElem.duration);
        return this.htmlAudioElem.duration;
    }

    seek(time: number): void {
        PeaksAudioPlayerAdapter.logger("seek() called with time:", time);
        this.htmlAudioElem.currentTime = time;
    }
}
