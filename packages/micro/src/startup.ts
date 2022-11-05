import { Context, Request, Response, Startup } from "@ipare/core";
import { initCatchError, initContext } from "./context";
import { parseBuffer } from "./parser";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    export interface ProcessEnv {
      IS_IPARE_MICRO: "true";
    }
  }
}

export type PacketType = { pattern: string; data: any; id?: string };

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

  protected handleMessage(
    buffer: Buffer,
    onSend: (arg: {
      packet: PacketType;
      result: string;
    }) => void | Promise<void>,
    onError?: (err: Error) => void
  ) {
    try {
      parseBuffer(buffer, async (packet) => {
        const req = new Request()
          .setPath(packet.pattern)
          .setBody(parseMicroBody(packet.data))
          .setId(packet.id);
        const res = await this.invoke(req);
        if (!req.id) return; // event

        const resultJson = JSON.stringify({
          id: req.id,
          data: res.body,
        });
        await onSend({
          packet,
          result: `${resultJson.length}#${resultJson}`,
        });
      });
    } catch (err) {
      const error = err as Error;
      if (onError) {
        onError(error);
      } else {
        console.error(error);
      }
    }
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
