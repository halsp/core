import { Context, Request, Response } from "@ipare/core";
import { MicroGrpcOptions, MicroGrpcStartup } from "@ipare/micro-grpc";
import { initBaseTestStartup, ITestStartup } from "../test-startup";

export class TestMicroGrpcStartup extends MicroGrpcStartup {
  constructor(options?: MicroGrpcOptions) {
    super(options);
    initBaseTestStartup(this);
  }

  protected async invoke(ctx: Request | Context): Promise<Response> {
    return await super.invoke(ctx);
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TestMicroGrpcStartup extends ITestStartup {}
