import { Inject } from "@ipare/inject";
import { OPTIONS_IDENTITY } from "./constant";

export const LoggerInject = (identity?: string) =>
  Inject(OPTIONS_IDENTITY + (identity ?? ""));
