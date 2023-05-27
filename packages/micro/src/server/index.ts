import "./startup";
import "./context";

declare module "@halsp/core" {
  interface Request {
    id?: string;
    setId(id?: string): this;

    get pattern(): string;
    get payload(): any;
    setPayload(val: any): this;
  }

  interface Response {
    get error(): string | undefined;
    set error(err: string | undefined);
    setError(err: string | undefined): this;

    get payload(): any;
    set payload(val: any);
    setPayload(val: any): this;
  }
}

export { handleMessage } from "./startup";
