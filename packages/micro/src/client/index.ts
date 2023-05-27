import { Context } from "@halsp/core";
import { parseInject } from "@halsp/inject";
import { MICRO_IDENTITY_KEY } from "./constant";

declare module "@halsp/core" {
  interface Context {
    getMicroClient<T = any>(identity?: string): Promise<T>;
  }
}

Context.prototype.getMicroClient = async function (
  identity?: string
): Promise<any> {
  const injectKey = MICRO_IDENTITY_KEY + (identity ?? "");
  return await parseInject(this, injectKey);
};

export { useMicroClient, InjectMicroClient } from "./use-client";
