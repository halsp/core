import { PatternType } from "./pattern";

declare module "@ipare/core" {
  interface Request {
    id?: string;
    setId(id?: string): this;

    get pattern(): PatternType;
  }

  interface Response {
    get error(): string | undefined;
    set error(err: string | undefined);
    setError(err: string | undefined): this;
  }
}

export { MicroException } from "./exception";
export { MicroStartup } from "./startup";
export { composePattern, parsePattern, PatternType } from "./pattern";
export { MicroClient } from "./client";
export { parseBuffer } from "./parser";
