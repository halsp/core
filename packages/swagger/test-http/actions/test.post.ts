import { Body, Header, Param, Query } from "@sfajs/pipe";
import { Action, HttpPost } from "@sfajs/router";
import {
  ApiSummary,
  ApiTags,
  DtoDeprecated,
  DtoDescription,
  DtoRequired,
} from "../../src";

export class BodyDto {
  @DtoDescription("sum")
  b1?: string;
  b2?: number;
}

export class HeaderDto {
  @DtoDescription("sum")
  @DtoRequired()
  h1?: string;

  @DtoDeprecated()
  h2?: number;
}

@ApiSummary("login test")
@ApiTags("test")
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
