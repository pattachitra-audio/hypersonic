let audioContext: AudioContext | null;

export function getGlobalAudioContext() {
    if (!audioContext) {
        audioContext = new AudioContext();
    }

    return audioContext;
}
