import type { RequestInfo, RequestInit, Response } from "undici";
import { fetch, errors } from "undici";
import { ResultAsync } from "neverthrow";

type UndiciFetchErrorTypes =
    | errors.ConnectTimeoutError
    | errors.HeadersTimeoutError
    | errors.HeadersOverflowError
    | errors.BodyTimeoutError
    | errors.ResponseError
    | errors.InvalidArgumentError
    | errors.InvalidReturnValueError
    | errors.RequestAbortedError
    | errors.InformationalError
    | errors.RequestContentLengthMismatchError
    | errors.ResponseContentLengthMismatchError
    | errors.ClientDestroyedError
    | errors.ClientClosedError
    | errors.SocketError
    | errors.NotSupportedError
    | errors.BalancedPoolMissingUpstreamError
    | errors.HTTPParserError
    | errors.ResponseExceededMaxSizeError
    | errors.RequestRetryError
    | errors.SecureProxyConnectionError
    | errors.MaxOriginsReachedError
    | errors.Socks5ProxyError
    | errors.MessageSizeExceededError
    | TypeError
    | DOMException
    | Error;

export function undiciFetch(input: RequestInfo, init?: RequestInit): ResultAsync<Response, UndiciFetchErrorTypes> {
    return ResultAsync.fromPromise(fetch(input, init), (error: unknown) => {
        if (
            error instanceof errors.ConnectTimeoutError ||
            error instanceof errors.HeadersTimeoutError ||
            error instanceof errors.HeadersOverflowError ||
            error instanceof errors.BodyTimeoutError ||
            error instanceof errors.ResponseError ||
            error instanceof errors.InvalidArgumentError ||
            error instanceof errors.InvalidReturnValueError ||
            error instanceof errors.RequestAbortedError ||
            error instanceof errors.InformationalError ||
            error instanceof errors.RequestContentLengthMismatchError ||
            error instanceof errors.ResponseContentLengthMismatchError ||
            error instanceof errors.ClientDestroyedError ||
            error instanceof errors.ClientClosedError ||
            error instanceof errors.SocketError ||
            error instanceof errors.NotSupportedError ||
            error instanceof errors.BalancedPoolMissingUpstreamError ||
            error instanceof errors.HTTPParserError ||
            error instanceof errors.ResponseExceededMaxSizeError ||
            error instanceof errors.RequestRetryError ||
            error instanceof errors.SecureProxyConnectionError ||
            error instanceof errors.MaxOriginsReachedError ||
            error instanceof errors.Socks5ProxyError ||
            error instanceof errors.MessageSizeExceededError ||
            error instanceof TypeError ||
            error instanceof DOMException
        ) {
            return error;
        }

        if (error instanceof Error) {
            return error;
        }

        return new Error("Unknown fetch error", { cause: error });
    });
}
