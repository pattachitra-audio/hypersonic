import { ProxyURLType } from "@/schemas/ProxyURL";

export type RequestType = {
    proxyURL: ProxyURLType;
    refreshToken: string;
};
