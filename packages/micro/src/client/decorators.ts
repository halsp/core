import { MICRO_IDENTITY_KEY } from "./constant";

export const MicroClient = (identity?: string) => {
  const { Inject } = _require(
    "@halsp/inject",
  ) as typeof import("@halsp/inject");
  return Inject(MICRO_IDENTITY_KEY + (identity ?? ""));
};
