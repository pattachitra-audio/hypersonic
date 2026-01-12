export interface Character {
    id: number;
    name: string;
    gender: string;
    ageRange: [number, number];
    voiceDescription: string;
    characterDescription: string;
    voiceId: string | null; // voiceId can be null initially
    dialogueCount: number;
}

export interface VoiceSettings {
    speed: number;
    stability: number;
    similarity: number;
    styleExaggeration: number;
    speakerBoost: boolean;
}

export interface AudioGeneration {
    id: string;
    generationNumber: number;
    duration: number; // in seconds
    isPlaying: boolean;
}
