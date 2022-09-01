import { Body, Header, Param, Query } from "@ipare/pipe";
import { Action, HttpPost } from "@ipare/router";
import { S } from "../../src";

export class HeaderDto {
  @S().Description("header-h1")
  @S().Required()
  h1?: string;

  @S().Deprecated()
  h2?: number;
}

export class BodyDto {
  @S().Description("body-b1").Required().Items(HeaderDto)
  b1?: string;
  b2?: number;
}

export class ResultDto {
  @S().Description("result-b1").Required().Items(String)
  b1?: string;
  @S()
  b2?: number;
  @S().Deprecated()
  b3?: BodyDto;
}

@S().Summary("login test")
@S().Tags("test").Response(ResultDto)
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
