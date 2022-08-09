import { Inject } from "@ipare/inject";
import { OPTIONS_IDENTITY } from "./constant";

export const MongoConnection = (identity?: string) =>
  Inject(OPTIONS_IDENTITY + (identity ?? ""));
