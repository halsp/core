import { Inject } from "@ipare/inject";
import { Body, Header } from "@ipare/pipe";
import { Action } from "@ipare/router";
import { V } from "@ipare/validator";

export class TestEmptyDto {}

export class TestBodyDto {
  @V().Description("sum")
  b1?: string;
  @V().Required()
  b2?: number;
  @V().Required()
  bigint?: bigint;
  @V().Required()
  bool?: boolean;
  @V().Required()
  arr?: string[];
  @V().Required()
  any?: any;
  @V().Required()
  date?: Date;
}

export class TestHeaderDto {
  @V().Required().Description("sum")
  h1?: string;

  @V().Deprecated()
  h2?: number;
}

@V().Tags("test")
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
  @V().Required()
  private readonly bbb!: string;

  async invoke(): Promise<void> {
    this.ok();
  }
}

@V().Tags("test")
@V().Summary("summary")
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
