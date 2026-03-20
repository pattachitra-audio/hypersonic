import { ProxyURLType } from "@/schemas/ProxyURL";

export type RequestType = {
    email: string;
    password: string;
    proxyURL: ProxyURLType;
};
