import { ProxyURLType } from "@/types/proxyURL";

export type RequestType = {
    proxyURL: ProxyURLType;
    bearerToken: string;

    inputs: {
        text: string;
        voiceID: string;
    }[];
    languageCode?: string;
    modelID: string;
    settings: {
        stability: number;
    };
};
