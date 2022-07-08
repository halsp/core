import { Dict } from "@sfajs/core";

declare module "@sfajs/core" {
  interface HttpContext {
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
export { cliConfig } from "./cli-config";
