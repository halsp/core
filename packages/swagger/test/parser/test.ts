import { Inject } from "@ipare/inject";
import { Body, Header } from "@ipare/pipe";
import { Action } from "@ipare/router";
import { S } from "../../src";

export class TestEmptyDto {}

export class TestBodyDto {
  @S().Description("sum")
  b1?: string;
  @S().Required()
  b2?: number;
  @S().Required()
  bigint?: bigint;
  @S().Required()
  bool?: boolean;
  @S().Required()
  arr?: string[];
  @S().Required()
  any?: any;
  @S().Required()
  date?: Date;
}

export class TestHeaderDto {
  @S().Required().Description("sum")
  h1?: string;

  @S().Deprecated()
  h2?: number;
}

@S().Tags("test")
@Inject
export class TestPost extends Action {
  constructor(@Header readonly header: TestHeaderDto) {
    super();
  }

  @Header
  private readonly h!: TestHeaderDto;
  @Header("h1")
  private readonly h1!: any;
  @Header
  private readonly h2!: any;
  @Body
  private readonly b!: TestBodyDto;
  @Body
  private readonly b1!: TestBodyDto;
  @Body("bbb")
  @S().Required()
  private readonly bbb!: string;

  async invoke(): Promise<void> {
    this.ok();
  }
}

@S().Tags("test")
@S().Summary("summary")
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
