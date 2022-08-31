import { Body, Header, Param, Query } from "@ipare/pipe";
import { Action, HttpPost } from "@ipare/router";
import { S } from "../../src";

export class BodyDto {
  @S().Description("sum")
  b1?: string;
  b2?: number;
}

export class HeaderDto {
  @S().Description("sum")
  @S().Required()
  h1?: string;

  @S().Deprecated()
  h2?: number;
}

@S().Summary("login test")
@S().Tags("test")
@HttpPost("test/^p")
export default class extends Action {
  @Header
  private readonly h!: HeaderDto;
  @Header("h1")
  private readonly h1!: any;
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
