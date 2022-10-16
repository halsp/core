import { Context, isNil, isObject } from "@ipare/core";
import { MicroException } from "@ipare/micro";

export class Message {
  pattern!: string;
  data?: any;
  id!: string;

  setPattern(val: string) {
    this.pattern = val;
    return this;
  }

  setData(val: any) {
    this.data = val;
    return this;
  }

  setId(val: any) {
    this.id = val;
    return this;
  }
}

export function createContext(message?: Message) {
  message = message ?? new Message();
  const ctx = new Context();
  Object.defineProperty(ctx, "msg", {
    enumerable: true,
    configurable: true,
    get: () => message,
  });
  Object.defineProperty(ctx, "message", {
    enumerable: true,
    configurable: true,
    get: () => ctx.msg,
  });

  const catchError = ctx.catchError;
  ctx.catchError = function (err: Error | any): Context {
    if (err instanceof MicroException) {
      this.result = err.toPlainObject();
    } else if (err instanceof Error) {
      const msg = err.message || undefined;
      this.catchError(new MicroException(msg));
    } else if (isObject(err)) {
      this.catchError(new MicroException(err));
    } else {
      const error = (!isNil(err) && String(err)) || undefined;
      this.catchError(new MicroException(error));
    }

    catchError.call(ctx, err);
    return this;
  };

  return ctx;
}
