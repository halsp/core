import { Inject } from "@sfajs/inject";
import { Body, Header } from "@sfajs/pipe";
import { Action } from "@sfajs/router";
import {
  ApiSummary,
  ApiTags,
  Deprecated,
  Description,
  Required,
} from "../../src";

export class TestEmptyDto {}

export class TestBodyDto {
  @Description("sum")
  b1?: string;
  @Required()
  b2?: number;
  @Required()
  bigint?: bigint;
  @Required()
  bool?: boolean;
  @Required()
  arr?: string[];
  @Required()
  any?: any;
  @Required()
  date?: Date;
}

export class TestHeaderDto {
  @Description("sum")
  @Required()
  h1?: string;

  @Deprecated()
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
  @Required()
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
