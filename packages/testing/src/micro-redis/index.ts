import { Context, Request, Response } from "@halsp/common";
import { MicroRedisOptions, MicroRedisStartup } from "@halsp/micro-redis";
import { initBaseTestStartup, ITestStartup } from "../test-startup";

export class TestMicroRedisStartup extends MicroRedisStartup {
  constructor(options?: MicroRedisOptions) {
    super(options);
    initBaseTestStartup(this);
  }

  protected async invoke(ctx: Request | Context): Promise<Response> {
    return await super.invoke(ctx);
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TestMicroRedisStartup extends ITestStartup {}
