import { Context, Request, Response } from "@ipare/core";
import { HttpStartup } from "@ipare/http";
import { initBaseTestStartup, ITestStartup } from "../test-startup";

export class TestHttpStartup extends HttpStartup {
  constructor() {
    super();
    initBaseTestStartup(this);
  }

  protected async invoke(ctx: Request | Context): Promise<Response> {
    return await super.invoke(ctx);
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TestHttpStartup extends ITestStartup {}
