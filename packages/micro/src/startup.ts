import { Startup } from "@halsp/common";
import { MicroContext } from "./context";
import { ClientPacket, ServerPacket } from "@halsp/micro-common";
import { MicroRequest } from "./context/request";
import { MicroResponse } from "./context/response";

export abstract class MicroStartup extends Startup<
  MicroRequest,
  MicroResponse,
  MicroContext
> {
  constructor() {
    super();
    process.env.HALSP_ENV = "micro";
  }

  protected async invoke(
    ctx: MicroRequest | MicroContext
  ): Promise<MicroResponse> {
    ctx = ctx instanceof MicroContext ? ctx : new MicroContext(ctx);

    return await super.invoke(ctx);
  }

  protected async handleMessage<T = object>(
    packet: ServerPacket,
    onSend: (arg: {
      req: MicroRequest;
      result: ClientPacket<T>;
      res: MicroResponse;
    }) => void | Promise<void>,
    prehook?: (ctx: MicroContext) => Promise<void> | void
  ) {
    const req = new MicroRequest()
      .setPattern(packet.pattern)
      .setPayload(parseMicroPayload(packet.data))
      .setId(packet.id);
    const ctx = new MicroContext(req);
    prehook && (await prehook(ctx));
    const res = await this.invoke(ctx);
    if (!req.id) return; // event

    const result: any = { id: req.id };
    if (res.error) {
      result.error = res.error;
    } else {
      result.data = res.payload;
    }
    await onSend({
      res,
      req,
      result: result,
    });
  }
}

export function parseMicroPayload(data: any) {
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
