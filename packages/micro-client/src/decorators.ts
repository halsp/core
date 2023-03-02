import { Inject } from "@halsp/inject";
import { MICRO_IDENTITY_KEY } from "./constant";

export const MicroClient = (identity?: string) =>
  Inject(MICRO_IDENTITY_KEY + (identity ?? ""));
