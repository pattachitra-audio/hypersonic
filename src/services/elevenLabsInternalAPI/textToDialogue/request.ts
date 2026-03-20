import z from "zod";
import { ProxyURLSchema } from "@/types/proxyURL";

const OutputFormats = [
    "ALAW_8000",
    "MP3_22050_32",
    "MP3_24000_48",
    "MP3_44100_128",
    "MP3_44100_192",
    "MP3_44100_32",
    "MP3_44100_64",
    "MP3_44100_96",
    "OPUS_48000_128",
    "OPUS_48000_192",
    "OPUS_48000_32",
    "OPUS_48000_64",
    "OPUS_48000_96",
    "PCM_16000",
    "PCM_22050",
    "PCM_24000",
    "PCM_32000",
    "PCM_44100",
    "PCM_48000",
    "PCM_8000",
    "ULAW_8000",
    "WAV_16000",
    "WAV_22050",
    "WAV_24000",
    "WAV_32000",
    "WAV_44100",
    "WAV_48000",
    "WAV_8000",
] as const;

type OutputFormat = Lowercase<(typeof OutputFormats)[number]>;

const OutputFormatSchema = z.enum(OutputFormats).transform((val): OutputFormat => val.toLowerCase() as OutputFormat);

export const RequestSchema = z.object({
    proxyURL: ProxyURLSchema,
    bearerToken: z.string(),
    inputs: z.array(
        z.object({
            text: z.string(),
            voiceID: z.string(),
        }),
    ),
    languageCode: z.string().optional(),
    modelID: z.string().optional(),
    outputFormat: OutputFormatSchema,
    settings: z.object({
        stability: z.number(),
    }),
});

export type RequestType = z.input<typeof RequestSchema>;
