import { Inject } from "@halsp/inject";
import { OPTIONS_IDENTITY } from "./constant";
import winston from "winston";

export const Logger = (identity?: string) =>
  Inject(OPTIONS_IDENTITY + (identity ?? ""));

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Logger extends winston.Logger {}
