import { MICRO_IDENTITY_KEY } from "./constant";

export const MicroClient = (identity?: string) => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Inject } = require("@halsp/inject") as typeof import("@halsp/inject");
  return Inject(MICRO_IDENTITY_KEY + (identity ?? ""));
};
