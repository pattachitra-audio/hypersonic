import z from "zod";
import { exchangeRefreshTokenForIDToken } from "@/services/elevenLabsFirebase/exchangeRefreshTokenForIDToken";
import { decodeElevenLabsFirebaseJWTPayload } from "@/utils/decodeElevenLabsFirebaseJWTPayload";
import { okAsync, ResultAsync } from "neverthrow";
import { Logger } from "pino";
import { LoggerResultAsync } from "@/lib/Logger";
import { Creator } from "@/interfaces/Creator";
import { ElevenLabsResource } from "../../resource";
import { zodParseAsync } from "@/utils/zodParse";
import { JSONSerializable } from "@/interfaces/JSONSerializable";
import { JSONDeserializable } from "@/interfaces/JSONDeserializable";

type PinoLogger = Logger<string>;

export class ElevenLabsFreeLaneEntry {
    public static Schema = z.object({
        resource: z.unknown(),
        balance: z.number(),
    });

    private constructor(
        public context: {
            logger: PinoLogger;
            resource: ElevenLabsResource;
            balance: number;
        },
    ) {}

    static serializeToJSON(obj: ElevenLabsFreeLaneEntry) {
        return ResultAsync.combine([ElevenLabsResource.serializeToJSON(obj.context.resource), obj.balance]).map(
            ([resource, balance]) => ({
                resource,
                balance,
            }),
        );
    }

    static deserializeFromJSON(obj: unknown) {
        return zodParseAsync(ElevenLabsFreeLaneEntry.Schema, obj)
            .andThen(({ resource, balance }) =>
                ElevenLabsResource.deserializeFromJSON(resource).map((resource) => ({ resource, balance })),
            )
            .andThen(({ resource, ...context }) =>
                ElevenLabsFreeLaneEntry.createLogger(resource.id).map((logger) => ({ resource, logger, ...context })),
            )
            .map((context) => new ElevenLabsFreeLaneEntry({ ...context }));
    }

    private static createLogger(id: string, parent?: PinoLogger) {
        const loggerBindings = {
            class: "ElevenLabsFreeLaneEntry",
            resourceId: id,
        };

        if (parent) {
            return okAsync(parent.child(loggerBindings));
        }

        return LoggerResultAsync.map((rootLogger) => rootLogger.child(loggerBindings));
    }

    public static create(resource: ElevenLabsResource) {
        const { proxyURL, refreshToken } = resource.context;

        return exchangeRefreshTokenForIDToken({ proxyURL, refreshToken })
            .andThen(({ idToken, refreshToken }) =>
                decodeElevenLabsFirebaseJWTPayload(idToken).map(({ expiry }) => ({
                    idTokenExpiryUnixMillis: expiry.getTime(),
                    refreshToken,
                    idToken,
                })),
            )
            .andThen((context) =>
                ElevenLabsFreeLaneEntry.createLogger(resource.id, resource.context.logger).map((logger) => ({
                    logger,
                    ...context,
                })),
            )
            .map(
                ({ logger }) =>
                    new ElevenLabsFreeLaneEntry({
                        logger,
                        resource,
                        balance: 0,
                    }),
            );
    }

    public get balance() {
        return okAsync(this.context.balance);
    }

    public invalidateBalance() {
        return okAsync();
    }

    public decrementBalance(amount: number) {
        this.context.balance -= amount;
        return okAsync();
    }

    public get resource() {
        return this.context.resource;
    }
}

ElevenLabsFreeLaneEntry satisfies Creator<ElevenLabsFreeLaneEntry> &
    JSONSerializable<ElevenLabsFreeLaneEntry> &
    JSONDeserializable<ElevenLabsFreeLaneEntry>;
