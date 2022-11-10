declare module "@ipare/core" {
  interface Request {
    id?: string;
    setId(id?: string): this;

    get pattern(): string;
  }

  interface Response {
    get error(): string | undefined;
    set error(err: string | undefined);
    setError(err: string | undefined): this;
  }
}

export { MicroException } from "./exception";
export { MicroStartup } from "./startup";
export { parseBuffer } from "./parser";
