import z from "zod";
import { ProxyURLBrand, ProxyURLSchema } from "@/brands/proxyURL";
import { decodeElevenLabsFirebaseJWTPayload } from "../decodeElevenLabsFirebaseJWTPayload";
import { exchangeRefreshTokenForIDToken } from "@/services/elevenLabsFirebase/exchangeRefreshTokenForIDToken";
import { ok, okAsync } from "neverthrow";
import { zodParse } from "../zodParse";
import { user } from "@/services/elevenLabsInternalAPI/user";

export class PRAOResource {
    static serializeToJSON(obj: PRAOResource) {
        return ok({
            id: obj.context.id,
            proxyURL: obj.context.proxyURL,
            refreshToken: obj.context.refreshToken,
            idToken: obj.context.idToken,
            idTokenExpiryUnixMillis: obj.context.idTokenExpiryUnixMillis,
            balance: obj.context.balance,
        });
    }

    static deserializeFromJSON(obj: unknown) {
        const schema = z.object({
            id: z.string(),
            proxyURL: ProxyURLSchema,
            refreshToken: z.string(),
            idToken: z.string(),
            idTokenExpiryUnixMillis: z.int(),
            balance: z.int(),
        });

        return zodParse(schema, obj).map((parsed) => new PRAOResource({ ...parsed, balanceStale: false }));
    }

    public constructor(
        public context: {
            id: string;
            proxyURL: ProxyURLBrand;
            refreshToken: string;
            idToken: string;
            idTokenExpiryUnixMillis: number;
            balance: number;
            balanceStale: boolean;
        },
    ) {}

    public static new(id: string, proxyURL: ProxyURLBrand, refreshToken: string) {
        return exchangeRefreshTokenForIDToken({ proxyURL, refreshToken })
            .andThen(({ idToken, refreshToken }) =>
                decodeElevenLabsFirebaseJWTPayload(idToken).map(({ expiry }) => ({
                    idTokenExpiryUnixMillis: expiry.getTime(),
                    refreshToken,
                    idToken,
                })),
            )
            .andThen(({ idToken, ...rest }) =>
                user({ bearerToken: idToken, proxyURL }).map(
                    ({ subscription: { characterCount, characterLimit } }) =>
                        new PRAOResource({
                            id,
                            proxyURL,
                            idToken,
                            balance: characterLimit - characterCount,
                            balanceStale: false,
                            ...rest,
                        }),
                ),
            );
    }

    public getBalance() {
        if (this.context.balanceStale) {
            return this.__updateBalance().map(() => this.context.balance);
        }

        return okAsync(this.context.balance);
    }

    private __updateBalance() {
        console.log(`__updateBalance for id ${this.context.id}`);

        return this.__validateIDToken().andThen(() =>
            user({ bearerToken: this.context.idToken, proxyURL: this.context.proxyURL }).andThen(
                ({ subscription: { characterCount, characterLimit } }) => {
                    this.context.balance = characterLimit - characterCount;
                    this.context.balanceStale = false;
                    return okAsync();
                },
            ),
        );
    }

    private __validateIDToken() {
        const self = this;
        console.log(`__validateIDToken for id ${this.context.id}`);

        if (self.context.idTokenExpiryUnixMillis < new Date().getTime() + 10_000) {
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
