import z from "zod";
import type { Logger } from "pino";
import { ProxyURLBrand, ProxyURLSchema } from "@/brands/proxyURL";
import { ok, okAsync } from "neverthrow";
import { zodParseAsync } from "../../zodParse";
import { exchangeRefreshTokenForIDToken } from "@/services/elevenLabsFirebase/exchangeRefreshTokenForIDToken";
import { decodeElevenLabsFirebaseJWTPayload } from "@/utils/decodeElevenLabsFirebaseJWTPayload";
import { JSONSerializable } from "@/interfaces/JSONSerializable";
import { Creator } from "@/interfaces/Creator";
import { JSONDeserializable } from "@/interfaces/JSONDeserializable";
import { LoggerResultAsync } from "@/lib/Logger";

type PinoLogger = Logger<string>;

export class ElevenLabsResource {
    public static Schema = z.object({
        id: z.string(),
        proxyURL: ProxyURLSchema,
        refreshToken: z.string(),
        idToken: z.string(),
        idTokenExpiryUnixMillis: z.int(),
    });

    public static serializeToJSON(obj: ElevenLabsResource) {
        return okAsync({
            id: obj.context.id,
            proxyURL: obj.context.proxyURL,
            refreshToken: obj.context.refreshToken,
            idToken: obj.context.idToken,
            idTokenExpiryUnixMillis: obj.context.idTokenExpiryUnixMillis,
        } as unknown);
    }

    public static deserializeFromJSON(obj: unknown) {
        return zodParseAsync(ElevenLabsResource.Schema, obj)
            .andThen((context) => this.createLogger(context.id).map((logger) => ({ context, logger })))
            .map(({ context, logger }) => new ElevenLabsResource({ ...context, logger }));
    }

    private constructor(
        public context: {
            id: string;
            proxyURL: ProxyURLBrand;
            refreshToken: string;
            idToken: string;
            idTokenExpiryUnixMillis: number;
            logger: PinoLogger;
        },
    ) {}

    private static createLogger(id: string, parent?: PinoLogger) {
        const loggerBindings = {
            class: "ElevenLabsResource",
            resourceId: id,
        };

        if (parent) {
            return okAsync(parent.child(loggerBindings));
        }

        return LoggerResultAsync.map((rootLogger) => rootLogger.child(loggerBindings));
    }

    public get id() {
        return this.context.id;
    }

    public static create(id: string, proxyURL: ProxyURLBrand, refreshToken: string) {
        return this.createLogger(id).andThen((logger) =>
            exchangeRefreshTokenForIDToken({ proxyURL, refreshToken })
                .andThen(({ idToken, refreshToken }) =>
                    decodeElevenLabsFirebaseJWTPayload(idToken).map(({ expiry }) => ({
                        idTokenExpiryUnixMillis: expiry.getTime(),
                        refreshToken,
                        idToken,
                    })),
                )
                .map((obj) => new ElevenLabsResource({ ...obj, id, proxyURL, logger })),
        );
    }

    public get refreshToken() {
        const self = this;
        return self.validateIDToken().map(() => self.context.refreshToken);
    }

    public get idToken() {
        const self = this;
        return self.validateIDToken().map(() => self.context.idToken);
    }

    public validateIDToken() {
        this.context.logger.debug("validateIDToken()");
        const self = this;

        if (self.context.idTokenExpiryUnixMillis < new Date().getTime() + 30_000) {
            return exchangeRefreshTokenForIDToken({
                proxyURL: self.context.proxyURL,
                refreshToken: self.context.refreshToken,
            })
                .andThen(({ idToken, ...rest }) =>
                    decodeElevenLabsFirebaseJWTPayload(idToken).map(({ expiry }) => ({
                        idToken,
                        expiry,
                        ...rest,
                    })),
                )
                .andThen(({ idToken, refreshToken, expiry }) => {
                    self.context.idToken = idToken;
                    self.context.refreshToken = refreshToken;
                    self.context.idTokenExpiryUnixMillis = expiry.getTime();

                    return ok();
                });
        }

        return okAsync();
    }
}

ElevenLabsResource satisfies JSONSerializable<ElevenLabsResource> &
    JSONDeserializable<ElevenLabsResource> &
    Creator<ElevenLabsResource>;
