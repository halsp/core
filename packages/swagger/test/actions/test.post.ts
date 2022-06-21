import { Action } from "@sfajs/router";
import { ApiSummary, ApiTags } from "../../src";

@ApiSummary("login test")
@ApiTags("test")
export default class extends Action {
  async invoke(): Promise<void> {
    this.ok();
  }
}
