import { Startup } from "../src";

export class TestStartup extends Startup {
  async run() {
    return await super.invoke();
  }
}
