import { Dict } from "@halsp/core";

declare module "@halsp/core" {
  interface Context {
    get lambdaContext(): Dict;
    get lambdaEvent(): Dict;
  }
  interface Request {
    get lambdaContext(): Dict;
    get lambdaEvent(): Dict;
  }
}

export { ResponseStruct } from "./response-struct";
export { LambdaStartup } from "./lambda-startup";
export { cliConfigHook } from "./cli-config";
