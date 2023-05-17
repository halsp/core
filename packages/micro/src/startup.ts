import {
  Context,
  HookType,
  isNil,
  isObject,
  Request,
  Response,
  Startup,
} from "@halsp/core";
import { ClientPacket, ServerPacket } from "@halsp/micro-common";
import { MicroException } from "./exception";

declare module "@halsp/core" {
  interface Startup {
    useMicro(): this;
  }
}

const usedMap = new WeakMap<Startup, boolean>();
Startup.prototype.useMicro = function () {
  if (usedMap.get(this)) return this;
  usedMap.set(this, true);

  process.env.HALSP_ENV = "micro";

  return this.hook(HookType.Unhandled, (ctx, md, error) => {
    const catchError = (err: Error | any) => {
      if (err instanceof MicroException) {
        ctx.res.setError(err.message);
      } else if (err instanceof Error) {
        const ex = new MicroException(err.message);
        ex.inner = err;
        catchError(ex);
      } else if (isObject(err)) {
        const ex = new MicroException(err);
        ex.inner = err;
        catchError(ex);
      } else {
        const error = (!isNil(err) && String(err)) || undefined;
        const ex = new MicroException(error);
        ex.inner = err;
        catchError(ex);
      }
    };
    catchError(error);
    return false;
  });
};

export async function handleMessage<T = object>(
  this: Startup,
  packet: ServerPacket,
  onSend: (arg: {
    req: Request;
    result: ClientPacket<T>;
    res: Response;
  }) => void | Promise<void>,
  prehook?: (ctx: Context) => Promise<void> | void
) {
  const req = new Request()
    .setPath(packet.pattern)
    .setBody(parseMicroBody(packet.data))
    .setId(packet.id);
  const ctx = new Context(req);
  prehook && (await prehook(ctx));
  const res = await this.invoke(ctx);
  if (!req.id) return; // event

  const result: any = { id: req.id };
  if (res.error) {
    result.error = res.error;
  } else {
    result.data = res.body;
  }
  await onSend({
    res,
    req,
    result: result,
  });
}

export function parseMicroBody(data: any) {
  if (typeof data == "string") {
    if (data.startsWith("{") || data.startsWith("[")) {
      try {
        return JSON.parse(data);
      } catch {
        return data;
      }
    } else {
      return data;
    }
  } else {
    return data;
  }
}
