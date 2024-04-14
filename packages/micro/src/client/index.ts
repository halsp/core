import "@halsp/inject";
import { Context } from "@halsp/core";
import { MICRO_IDENTITY_KEY } from "./constant";

declare module "@halsp/core" {
  interface Context {
    getMicroClient<T = any>(identity?: string): Promise<T>;
  }
}

Context.prototype.getMicroClient = async function (
  identity?: string,
): Promise<any> {
  const injectKey = MICRO_IDENTITY_KEY + (identity ?? "");
  return await this.getService(injectKey);
};

export { useMicroClient, InjectMicroClient } from "./use-client";
export { IMicroClient } from "./client";
export { MicroClient } from "./decorators";
