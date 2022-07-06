import { Dict } from "@sfajs/core";
import { ResponseStruct } from "./response-struct";

declare module "@sfajs/core" {
  interface HttpContext {
    get cloudbaseContext(): Dict;
    get cloudbaseEvent(): Dict;
  }
  interface SfaRequest {
    get cloudbaseContext(): Dict;
    get cloudbaseEvent(): Dict;
  }
}

export { ResponseStruct };
export { SfaCloudbase } from "./sfa-cloudbase";
export { cliConfig } from "./cli-config";
