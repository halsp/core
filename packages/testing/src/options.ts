import { Request } from "@ipare/core";

export interface SkipThrowOptions {
  skipThrow?: boolean;
}

export interface TestStartupOptions extends SkipThrowOptions {
  req?: Request;
}
