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
