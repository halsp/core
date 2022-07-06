import { Dict } from "@sfajs/core";
import { ResponseStruct } from "./response-struct";

declare module "@sfajs/core" {
  interface SfaRequest {
    get context(): Dict;
    get event(): Dict;
  }
}

export { ResponseStruct };
export { SfaCloudbase } from "./sfa-cloudbase";
export { cliConfig } from "./cli-config";
