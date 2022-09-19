import { Startup } from "../src/startup";
import { Context } from "../src/context";

export class TestStartup extends Startup {
  async run(): Promise<Context> {
    const ctx = new Context();
    return await super.invoke(ctx);
  }
}
