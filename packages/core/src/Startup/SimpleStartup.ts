import Startup from ".";
import Response from "../Response";

export default class SimpleStartup extends Startup {
  async run(): Promise<Response> {
    return await super.invoke();
  }
}
