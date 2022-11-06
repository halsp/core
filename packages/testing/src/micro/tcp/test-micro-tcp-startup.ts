import { Context, Request, Response } from "@ipare/core";
import { MicroTcpOptions, MicroTcpStartup } from "@ipare/micro/dist/tcp";
import { initBaseTestStartup, ITestStartup } from "../../test-startup";

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
