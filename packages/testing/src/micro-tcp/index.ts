import { Context, Request, Response } from "@halsp/common";
import { MicroTcpOptions, MicroTcpStartup } from "@halsp/micro-tcp";
import { initBaseTestStartup, ITestStartup } from "../test-startup";

export class TestMicroTcpStartup extends MicroTcpStartup {
  constructor(options?: MicroTcpOptions) {
    super(options);
    initBaseTestStartup(this);
  }

  protected async invoke(ctx: Request | Context): Promise<Response> {
    return await super.invoke(ctx);
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TestMicroTcpStartup extends ITestStartup {}
