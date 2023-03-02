import { Inject } from "@halsp/inject";
import { OPTIONS_IDENTITY } from "./constant";

export const Logger = (identity?: string) =>
  Inject(OPTIONS_IDENTITY + (identity ?? ""));
