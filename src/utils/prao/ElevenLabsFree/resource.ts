import z from "zod";
import { ProxyURLBrand, ProxyURLSchema } from "@/brands/proxyURL";
import { decodeElevenLabsFirebaseJWTPayload } from "../../decodeElevenLabsFirebaseJWTPayload";
import { exchangeRefreshTokenForIDToken } from "@/services/elevenLabsFirebase/exchangeRefreshTokenForIDToken";
import { ok, okAsync } from "neverthrow";
import { zodParse } from "../../zodParse";

export class ElevenLabsFreeResource {
    static serializeToJSON(obj: ElevenLabsFreeResource) {
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

        return zodParse(schema, obj).map((parsed) => new ElevenLabsFreeResource({ ...parsed }));
    }

    private constructor(
        public context: {
            id: string;
            proxyURL: ProxyURLBrand;
            refreshToken: string;
            idToken: string;
            idTokenExpiryUnixMillis: number;
            balance: number;
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
            .map((value) => new ElevenLabsFreeResource({ id, proxyURL, balance: 0, ...value }));
    }

    public getBalance() {
        return okAsync(this.context.balance);
    }

    public validateIDToken() {
        const self = this;
        console.log(`validateIDToken() for id ${this.context.id}`);

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
