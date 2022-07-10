import { Inject } from "@sfajs/inject";
import { Body, Header } from "@sfajs/pipe";
import { Action } from "@sfajs/router";
import {
  ApiSummary,
  ApiTags,
  DtoDeprecated,
  DtoDescription,
  DtoRequired,
} from "../../src";

export class TestEmptyDto {}

export class TestBodyDto {
  @DtoDescription("sum")
  b1?: string;
  @DtoRequired()
  b2?: number;
  @DtoRequired()
  bigint?: bigint;
  @DtoRequired()
  bool?: boolean;
  @DtoRequired()
  arr?: string[];
  @DtoRequired()
  any?: any;
  @DtoRequired()
  date?: Date;
}

export class TestHeaderDto {
  @DtoDescription("sum")
  @DtoRequired()
  h1?: string;

  @DtoDeprecated()
  h2?: number;
}

@ApiTags("test")
@Inject
export class TestPost extends Action {
  constructor(@Header readonly header: TestHeaderDto) {
    super();
  }

  @Header
  private readonly h!: TestHeaderDto;
  @Header("h1")
  private readonly h1!: any;
  @Body
  private readonly b!: TestBodyDto;
  @Body("bbb")
  @DtoRequired()
  private readonly bbb!: string;

  async invoke(): Promise<void> {
    this.ok();
  }
}

@ApiTags("test")
@ApiSummary("summary")
export class TestGet extends Action {
  @Header
  private readonly h!: TestHeaderDto;
  @Header("h1")
  private readonly h1!: any;
  @Body
  private readonly b!: TestBodyDto;
  @Body("bbb")
  private readonly bbb!: string;

  async invoke(): Promise<void> {
    this.ok();
  }
}
