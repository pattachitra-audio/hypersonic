import z from "zod";
import { err } from "neverthrow";
import { decodeBase64 } from "./decodeBase64";
import { parseUTF8String } from "./parseUTF8String";
import { parseJSON } from "./parseJSON";
import { zodParse } from "./zodParse";

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

export function decodeElevenLabsFirebaseJWTPayload(jwt: string) {
    const parts = jwt.split(".");

    if (parts.length !== 3) {
        return err(
            `Invalid jwt format; Expected '<header>.<payload>.<signature>', where 'header', 'payload', and 'signature' are base64 strings`,
        );
    }

    const payloadBase64 = parts[1];
    return decodeBase64(payloadBase64)
        .andThen(parseUTF8String)
        .andThen(parseJSON)
        .andThen((obj) => zodParse(ElevenLabsFirebaseJWTSchema, obj));
}
