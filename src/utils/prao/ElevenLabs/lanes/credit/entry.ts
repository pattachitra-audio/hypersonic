import z from "zod";
import { exchangeRefreshTokenForIDToken } from "@/services/elevenLabsFirebase/exchangeRefreshTokenForIDToken";
import { decodeElevenLabsFirebaseJWTPayload } from "@/utils/decodeElevenLabsFirebaseJWTPayload";
import { user } from "@/services/elevenLabsInternalAPI/user";
import { okAsync, ResultAsync } from "neverthrow";
import { Logger } from "pino";
import { LoggerResultAsync } from "@/lib/Logger";
import { Creator } from "@/interfaces/Creator";
import { ElevenLabsResource } from "../../resource";
import { zodParseAsync } from "@/utils/zodParse";
import { JSONSerializable } from "@/interfaces/JSONSerializable";
import { JSONDeserializable } from "@/interfaces/JSONDeserializable";

type PinoLogger = Logger<string>;

export class ElevenLabsCreditLaneEntry {
    public static Schema = z.object({
        resource: z.unknown(),
        balance: z.number(),
    });

    private constructor(
        public context: {
            logger: PinoLogger;
            resource: ElevenLabsResource;
            balance: number;
            balanceStale: boolean;
        },
    ) {}

    static serializeToJSON(obj: ElevenLabsCreditLaneEntry) {
        return ResultAsync.combine([ElevenLabsResource.serializeToJSON(obj.context.resource), obj.balance]).map(
            ([resource, balance]) => ({
                resource,
                balance,
            }),
        );
    }

    static deserializeFromJSON(obj: unknown) {
        return zodParseAsync(ElevenLabsCreditLaneEntry.Schema, obj)
            .andThen(({ resource, balance }) =>
                ElevenLabsResource.deserializeFromJSON(resource).map((resource) => ({ resource, balance })),
            )
            .andThen(({ resource, ...context }) =>
                ElevenLabsCreditLaneEntry.createLogger(resource.id).map((logger) => ({ resource, logger, ...context })),
            )
            .map((context) => new ElevenLabsCreditLaneEntry({ ...context, balanceStale: false }));
    }

    private static createLogger(id: string, parent?: PinoLogger) {
        const loggerBindings = {
            class: "ElevenLabsCreditLaneEntry",
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
                user({ bearerToken: context.idToken, proxyURL }).map((userInfo) => ({ userInfo, ...context })),
            )
            .andThen((context) =>
                ElevenLabsCreditLaneEntry.createLogger(resource.id, resource.context.logger).map((logger) => ({
                    logger,
                    ...context,
                })),
            )
            .map(
                ({
                    logger,
                    userInfo: {
                        subscription: { characterLimit, characterCount },
                    },
                }) =>
                    new ElevenLabsCreditLaneEntry({
                        logger,
                        resource,
                        balance: characterLimit - characterCount,
                        balanceStale: false,
                    }),
            );
    }

    public get balance() {
        if (this.context.balanceStale) {
            return this.validateBalance().map(() => this.context.balance);
        }

        return okAsync(this.context.balance);
    }

    public decrementBalance(amount: number) {
        this.context.balance -= amount;
        return okAsync();
    }

    public get resource() {
        return this.context.resource;
    }

    public invalidateBalance() {
        this.context.balanceStale = true;
        return okAsync();
    }

    public validateBalance() {
        return this.context.resource.idToken.andThen((idToken) =>
            user({ bearerToken: idToken, proxyURL: this.context.resource.context.proxyURL }).andThen(
                ({ subscription: { characterCount, characterLimit } }) => {
                    this.context.balance = characterLimit - characterCount;
                    this.context.balanceStale = false;
                    return okAsync();
                },
            ),
        );
    }
}

ElevenLabsCreditLaneEntry satisfies Creator<ElevenLabsCreditLaneEntry> &
    JSONSerializable<ElevenLabsCreditLaneEntry> &
    JSONDeserializable<ElevenLabsCreditLaneEntry>;
