import { Context, Request, Response, Startup } from "../src";

export class TestStartup extends Startup {
  async run() {
    return await this.invoke();
  }

  protected async invoke(ctx?: Request | Context): Promise<Response> {
    return await super.invoke(ctx ?? new Context());
  }
}
