import { Header } from "@sfajs/pipe";
import { Action } from "@sfajs/router";
import { ApiSummary, ApiTags } from "../../src";

class HeaderDto {
  h1?: string;
  h2?: number;
}

@ApiSummary("login test")
@ApiTags("test")
export default class extends Action {
  // @Header("h")
  // private readonly body!: any;
  @Header
  private readonly h111!: HeaderDto;

  async invoke(): Promise<void> {
    this.ok();
  }
}
