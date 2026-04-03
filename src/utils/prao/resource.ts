import z from "zod";
import { ProxyURLBrand, ProxyURLSchema } from "@/brands/proxyURL";
import { decodeElevenLabsFirebaseJWTPayload } from "../decodeElevenLabsFirebaseJWTPayload";
import { exchangeRefreshTokenForIDToken } from "@/services/elevenLabsFirebase/exchangeRefreshTokenForIDToken";
import { ok, okAsync } from "neverthrow";
import { parseJSON } from "../parseJSON";
import { zodParse } from "../zodParse";
import { user } from "@/services/elevenLabsInternalAPI/user";

export class PRAOResource {
    static serialize(obj: PRAOResource) {
        return ok(
            JSON.stringify({
                ...obj.context,
            }),
        );
    }

    static deserialize(str: string) {
        const schema = z.object({
            id: z.string(),
            proxyURL: ProxyURLSchema,
            refreshToken: z.string(),
            idToken: z.string(),
            idTokenExpiryUnixMillis: z.int(),
            balance: z.int(),
        });

        return parseJSON(str)
            .andThen((obj) => zodParse(schema, obj))
            .map((obj) => new PRAOResource({ ...obj, balanceStale: false }));
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
