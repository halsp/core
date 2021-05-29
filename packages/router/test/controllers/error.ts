import { ResponseError, StatusCode } from "sfa";
import { Action } from "../../src";

export default class extends Action {
  async invoke(): Promise<void> {
    throw new ResponseError()
      .setStatus(StatusCode.badRequest)
      .setBody({ message: "br" });
  }
}
