import { Body, Header, Param, Query } from "@sfajs/pipe";
import { Action } from "@sfajs/router";
import { ApiSummary, ApiTags, PropertyDescription } from "../../src";

export class BodyDto {
  @PropertyDescription("sum")
  h1?: string;
  h2?: number;
}

@ApiSummary("login test")
@ApiTags("test")
export default class extends Action {
  @Header("h")
  private readonly h!: any;
  @Query("q")
  private readonly q!: any;
  @Param("p")
  private readonly p!: any;
  @Body
  private readonly b!: BodyDto;
  @Body("bbb")
  private readonly bbb!: string;

  async invoke(): Promise<void> {
    this.ok();
  }
}
