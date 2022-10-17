import { Context, Request, Response, Startup } from "@ipare/core";
import { initCatchError } from "./context";

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
  }

  protected async invoke(ctx: Context | Request): Promise<Response> {
    ctx = ctx instanceof Request ? new Context(ctx) : ctx;
    initCatchError(ctx);

    return await super.invoke(ctx);
  }

  abstract listen(): void;
  abstract close(): Promise<void>;
}
