import { Context } from "@ipare/core";
import { parseInject } from "@ipare/inject";
import { MICRO_IDENTITY_KEY } from "./constant";

export { MicroClient } from "./decorators";
export { IMicroClient } from "./client";
export { useMicroClient, InjectMicroClient } from "./use-client";

declare module "@ipare/core" {
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
