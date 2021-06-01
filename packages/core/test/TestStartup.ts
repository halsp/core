import { Startup, Response } from "../src";

export default class TestStartup extends Startup {
  async run(): Promise<Response> {
    return await super.invoke();
  }
}
