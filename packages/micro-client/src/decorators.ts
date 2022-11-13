import { Inject } from "@ipare/inject";
import { MicroIdentityKey } from "./constant";

export const MicroClient = (identity?: string) =>
  Inject(MicroIdentityKey + (identity ?? ""));
