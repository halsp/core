import { Context, Request, Response } from "@ipare/core";
import { MicroStartup } from "@ipare/micro";
import { initBaseTestStartup, ITestStartup } from "@ipare/testing";

export class TestMicroStartup extends MicroStartup {
  constructor() {
    super();
    initBaseTestStartup(this);
  }

  protected async invoke(ctx: Request | Context): Promise<Response> {
    return await super.invoke(ctx);
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TestMicroStartup extends ITestStartup {}
