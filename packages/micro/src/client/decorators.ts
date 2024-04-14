import { MICRO_IDENTITY_KEY } from "./constant";
import { Inject } from "@halsp/inject";

export const MicroClient = (identity?: string) =>
  Inject(MICRO_IDENTITY_KEY + (identity ?? ""));
