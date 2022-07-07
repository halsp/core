import { Dict } from "@sfajs/core";
import { ResponseStruct } from "./response-struct";

declare module "@sfajs/core" {
  interface HttpContext {
    get lambdaContext(): Dict;
    get lambdaEvent(): Dict;
  }
  interface SfaRequest {
    get lambdaContext(): Dict;
    get lambdaEvent(): Dict;
  }
}

export { ResponseStruct };
export { LambdaStartup } from "./lambda-startup";
export { cliConfig } from "./cli-config";
