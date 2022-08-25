import { Inject } from "@ipare/inject";
import { OPTIONS_IDENTITY } from "./constant";

export const MongooseInject = (identity?: string) =>
  Inject(OPTIONS_IDENTITY + (identity ?? ""));
