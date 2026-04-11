import pino from "pino";
import { EnvResultAsync } from "./Env";

export const LoggerResultAsync = EnvResultAsync.map((env) => pino({ level: env.LOG_LEVEL ?? "debug" }));
