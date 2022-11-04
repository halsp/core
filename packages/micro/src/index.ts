export { MicroException } from "./exception";
export { MicroStartup } from "./startup";

declare module "@ipare/core" {
  interface Request {
    id: string;
    setId(id: string): this;
  }
  interface Response {
    get status(): string | undefined;
    set status(status: string | undefined);
    setStatus(status: string): this;

    get error(): string | undefined;
    set error(err: string | undefined);
    setError(err: string | undefined): this;
  }
}
