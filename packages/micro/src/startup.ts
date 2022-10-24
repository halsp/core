import { Context, Request, Response, Startup } from "@ipare/core";
import { initCatchError, initContext } from "./context";

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
}
