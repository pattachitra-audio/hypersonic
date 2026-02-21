// import { Err, Ok } from "neverthrow";
import { err, ok } from "neverthrow";
import type { Result, ResultAsync } from "neverthrow";

const NoThrow = {
    err,
    ok,
};

export { Result, ResultAsync };

export default NoThrow;
