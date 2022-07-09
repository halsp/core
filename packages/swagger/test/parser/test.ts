import { Inject } from "@sfajs/inject";
import { Body, Header } from "@sfajs/pipe";
import { Action } from "@sfajs/router";
import {
  ApiSummary,
  ApiTags,
  PropertyDeprecated,
  PropertyDescription,
  PropertyRequired,
} from "../../src";

export class TestEmptyDto {}

export class TestBodyDto {
  @PropertyDescription("sum")
  b1?: string;
  @PropertyRequired()
  b2?: number;
  @PropertyRequired()
  bigint?: bigint;
  @PropertyRequired()
  bool?: boolean;
  @PropertyRequired()
  arr?: string[];
  @PropertyRequired()
  any?: any;
  @PropertyRequired()
  date?: Date;
}

export class TestHeaderDto {
  @PropertyDescription("sum")
  @PropertyRequired()
  h1?: string;

  @PropertyDeprecated()
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
  @PropertyRequired()
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
