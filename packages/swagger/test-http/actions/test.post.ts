import { Body, Header, Param, Query } from "@ipare/pipe";
import { Action, HttpPost } from "@ipare/router";
import { V } from "@ipare/validator";

export class HeaderDto {
  @V().Description("header-h1")
  @V().Required()
  hd1?: string;

  @V().Deprecated()
  hd2?: number;
}

export class BodyDto {
  @V().Description("body-b1").Required().Items(HeaderDto)
  bd1?: HeaderDto[];
  bd2?: number;
}

export class ResultDto {
  @V().Description("result-b1").Required().Items(String)
  rd1?: string;
  @V()
  rd2?: number;
  @V()
    .Deprecated()
    .Items([[BodyDto]])
  rd3?: BodyDto;
}

@V().Summary("login test")
@V().Tags("test").Response(ResultDto)
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
