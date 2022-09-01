import { Body } from "@ipare/pipe";
import { Action } from "@ipare/router";
import { S } from "../../src";

class TestDto {
  @S().Description("test")
  test?: string;
}

@S().Tags("test").Summary("summary")
export class StringBody extends Action {
  @Body
  @S().Description("abc")
  private readonly b!: string;

  async invoke(): Promise<void> {
    this.ok();
  }
}

@S().Tags("test").Summary("summary")
export class PartialBody extends Action {
  @Body("b")
  @S().Description("abc")
  private readonly b!: string;
  @Body
  private readonly body!: TestDto;

  async invoke(): Promise<void> {
    this.ok();
  }
}

@S().Tags("test").Summary("summary")
export class StringBodyTwice extends Action {
  @Body
  @S().Description("abc")
  private readonly b1!: string;
  @Body
  @S().Description("def")
  private readonly b2!: number;

  async invoke(): Promise<void> {
    this.ok();
  }
}
