import { ProxyURLType } from "@/schemas/ProxyURL";

export type RequestType = {
    proxyURL: ProxyURLType;
    bearerToken: string;
};
