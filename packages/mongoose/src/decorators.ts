import { Inject } from "@halsp/inject";
import { OPTIONS_IDENTITY } from "./constant";

export const Mongoose = (identity?: string) =>
  Inject(OPTIONS_IDENTITY + (identity ?? ""));
