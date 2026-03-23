import z from "zod";
import { NoThrow } from "./NoThrow";

const ElevenLabsFirebaseJWTSchema = z
    .object({
        workspace_id: z.string(),
        workspace_user_id: z.string(),
        user_id: z.string(),
        email: z.string(),
        email_verified: z.boolean(),
    })
    .transform(
        ({
            workspace_id: workspaceID,
            workspace_user_id: workspaceUserID,
            user_id: userID,
            email_verified: emailVerified,
            ...rest
        }) => ({
            workspaceID,
            workspaceUserID,
            userID,
            emailVerified,
            ...rest,
        }),
    );

export async function decodeElevenLabsFirebaseJWTPayload(jwt: string) {
    const parts = jwt.split(".");

    if (parts.length !== 3) {
        return NoThrow.error(
            new Error(
                `Invalid jwt format; Expected '<header>.<payload>.<signature>', where 'header', 'payload', and 'signature' are base64 strings`,
            ),
        );
    }

    const payloadBase64 = parts[1];
    let payloadString: string;

    try {
        payloadString = atob(payloadBase64);
    } catch (error) {
        return NoThrow.error(new Error("Error while decoding base64", { cause: error }));
    }

    let payloadObject: unknown;

    try {
        payloadObject = JSON.parse(payloadString);
    } catch (error) {
        return NoThrow.error(new Error("Error while parsing (JSON) payload string", { cause: error }));
    }

    const payloadResult = await ElevenLabsFirebaseJWTSchema.safeParseAsync(payloadObject);

    if (!payloadResult.success) {
        return NoThrow.error(payloadResult.error);
    }

    return NoThrow.ok(payloadResult.data);
}
