import { ProxyURLType } from "@/schemas/ProxyURL";
import { ProxyAgent } from "undici";

class ProxyAgentPool {
    private proxyURLToAgent: Map<string, ProxyAgent>;

    constructor() {
        this.proxyURLToAgent = new Map<string, ProxyAgent>();
    }

    get(proxyURL: ProxyURLType) {
        const proxyAgent = this.proxyURLToAgent.get(proxyURL);

        if (proxyAgent) {
            return proxyAgent;
        }

        const newProxyAgent = new ProxyAgent({
            uri: proxyURL,
            connections: 20,
            keepAliveTimeout: 172_800_000 /* 2 days */,
        });
        this.proxyURLToAgent.set(proxyURL, newProxyAgent);

        return newProxyAgent;
    }

    async close(proxyURL: ProxyURLType) {
        const proxyAgent = this.proxyURLToAgent.get(proxyURL);

        if (!proxyAgent) {
            return;
        }

        await proxyAgent.close();
        this.proxyURLToAgent.delete(proxyURL);
    }

    async closeAll() {
        await Promise.all([...this.proxyURLToAgent.values()].map((proxyAgent) => proxyAgent.close()));
        this.proxyURLToAgent.clear();
    }
}

export const proxyAgentPool = new ProxyAgentPool();
