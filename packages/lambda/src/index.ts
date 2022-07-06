import { Dict } from "@sfajs/core";
import { ResponseStruct } from "./response-struct";

declare module "@sfajs/core" {
  interface SfaRequest {
    readonly context: Dict;
    readonly event: Dict;
  }
}

export { ResponseStruct };
export { SfaCloudbase } from "./sfa-cloudbase";
