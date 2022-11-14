import { Context, Request, Response, Startup } from "@ipare/core";
import { initCatchError, initContext } from "./context";
import { ServerPacket } from "@ipare/micro-common";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    export interface ProcessEnv {
      IS_IPARE_MICRO: "true";
    }
  }
}

export abstract class MicroStartup extends Startup {
  constructor() {
    super();
    process.env.IS_IPARE_MICRO = "true";
    initContext();
  }

  protected async invoke(ctx: Request | Context): Promise<Response> {
    ctx = ctx instanceof Context ? ctx : new Context(ctx);
    initCatchError(ctx);

    return await super.invoke(ctx);
  }

  protected async handleMessage(
    packet: ServerPacket,
    onSend: (arg: {
      req: Request;
      result: string;
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
      result: JSON.stringify(result),
    });
  }
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
