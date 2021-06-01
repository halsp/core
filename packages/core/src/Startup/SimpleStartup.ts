import { Startup, Response } from "..";

export default class SimpleStartup extends Startup {
  async run(): Promise<Response> {
    return await super.invoke();
  }
}
