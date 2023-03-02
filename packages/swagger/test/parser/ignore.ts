import { Body, Header } from "@halsp/pipe";
import { Action } from "@halsp/router";
import { V } from "@halsp/validator";

@V.Tags("test").Ignore()
export class IgnoreAction extends Action {
  async invoke(): Promise<void> {
    this.ok();
  }
}

@V.Tags("test")
export class IgnoreProperty extends Action {
  @Header @V.Ignore() private readonly h1!: string;

  async invoke(): Promise<void> {
    this.ok(this.h1);
  }
}

@V.Tags("test")
export class IgnoreParam extends Action {
  constructor(@Header @V.Ignore() private readonly h1: string) {
    super();
  }

  async invoke(): Promise<void> {
    this.ok(this.h1);
  }
}

class TestDto {
  @V.Required()
  b1!: Date;

  @V.Required().Ignore()
  b2!: string;

  @V.Ignore().Required()
  b3!: number;
}

@V.Tags("test")
export class IgnoreBodyModel extends Action {
  @Body private readonly body!: TestDto;

  async invoke(): Promise<void> {
    this.ok(this.body);
  }
}

@V.Tags("test")
export class IgnoreParamModel extends Action {
  @Header private readonly body!: TestDto;

  async invoke(): Promise<void> {
    this.ok(this.body);
  }
}
