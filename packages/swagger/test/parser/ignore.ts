import { Body, Header } from "@ipare/pipe";
import { Action } from "@ipare/router";
import { S } from "../../src";

@S().Tags("test").Ignore()
export class IgnoreAction extends Action {
  async invoke(): Promise<void> {
    this.ok();
  }
}

@S().Tags("test")
export class IgnoreProperty extends Action {
  @Header @S().Ignore() private readonly h1!: string;

  async invoke(): Promise<void> {
    this.ok(this.h1);
  }
}

@S().Tags("test")
export class IgnoreParam extends Action {
  constructor(@Header @S().Ignore() private readonly h1: string) {
    super();
  }

  async invoke(): Promise<void> {
    this.ok(this.h1);
  }
}

class TestDto {
  @S().Required()
  b1!: string;

  @S().Required().Ignore()
  b2!: string;

  @S().Ignore().Required()
  b3!: number;
}

@S().Tags("test")
export class IgnoreBodyModel extends Action {
  @Body private readonly body!: TestDto;

  async invoke(): Promise<void> {
    this.ok(this.body);
  }
}

@S().Tags("test")
export class IgnoreParamModel extends Action {
  @Header private readonly body!: TestDto;

  async invoke(): Promise<void> {
    this.ok(this.body);
  }
}
