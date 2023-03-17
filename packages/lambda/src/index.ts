import { Dict } from "@halsp/common";

declare module "@halsp/http" {
  interface HttpContext {
    get lambdaContext(): Dict;
    get lambdaEvent(): Dict;
  }
  interface HttpRequest {
    get lambdaContext(): Dict;
    get lambdaEvent(): Dict;
  }
}

export { ResponseStruct } from "./response-struct";
export { LambdaStartup } from "./lambda-startup";
export { cliConfigHook } from "./cli-config";
