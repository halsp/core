import { Dict } from "@ipare/core";

export { MicroException } from "./exception";
export { MicroStartup } from "./startup";

declare module "@ipare/core" {
  interface Request {
    get pattern(): string | Dict<any>;
    setPattern(pattern: string | Dict<any>): this;
    get body(): any;
    setBody(body: unknown): this;
  }
  interface Response {
    body: any;
    setBody(body: unknown): this;
  }
}
