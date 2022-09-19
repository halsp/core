import { Body } from "@ipare/pipe";
import { Action } from "@ipare/router";
import { V } from "@ipare/validator";

class TestDto {
  @V.Description("test")
  test?: string;
}

@V.Tags("test").Summary("summary")
export class StringBody extends Action {
  @Body
  @V.Description("abc")
  private readonly b!: string;

  async invoke(): Promise<void> {
    this.ok();
  }
}

@V.Tags("test").Summary("summary")
export class PartialBody extends Action {
  @Body("b")
  @V.Description("abc")
  private readonly b!: string;
  @Body
  private readonly body!: TestDto;

  async invoke(): Promise<void> {
    this.ok();
  }
}

@V.Tags("test").Summary("summary")
export class StringBodyTwice extends Action {
  @Body
  @V.Description("abc")
  private readonly b1!: string;
  @Body
  @V.Description("def")
  private readonly b2!: number;

  async invoke(): Promise<void> {
    this.ok();
  }
}

class TestSchemaDto {}

@V.Tags("test").Summary("summary")
export class DtoSchema extends Action {
  @Body
  @V.Description("desc")
  private readonly b1!: TestSchemaDto;

  async invoke(): Promise<void> {
    this.ok();
  }
}

@V.Description("desc2")
class TestSchemaOverrideDto {}

@V.Tags("test").Summary("summary")
export class DtoSchemaOverride extends Action {
  @Body
  @V.Description("desc2")
  private readonly b1!: TestSchemaOverrideDto;

  async invoke(): Promise<void> {
    this.ok();
  }
}
