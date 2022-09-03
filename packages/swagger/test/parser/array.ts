import { Body, Header } from "@ipare/pipe";
import { Action } from "@ipare/router";
import { V } from "@ipare/validator";

class TestDto {
  @V().Description("desc")
  b1?: string;
}

class StringArrayPropertyDto {
  @V().Description("desc").Items(String)
  b1?: string[];

  @V()
  b2?: TestDto;
}

class ModelArrayPropertyDto {
  @V().Description("desc").Items(TestDto)
  b1?: TestDto[];

  @V()
  b2?: TestDto;
}

@V().Tags("test").Summary("summary")
export class NotArray extends Action {
  @Body
  private readonly b1!: TestDto;

  async invoke(): Promise<void> {
    this.ok();
  }
}

@V().Tags("test").Summary("summary")
export class ArrayModel extends Action {
  @Body
  @V().Items(TestDto)
  private readonly b1!: TestDto[];

  async invoke(): Promise<void> {
    this.ok();
  }
}

@V().Tags("test").Summary("summary")
export class TwoDimensionalArray extends Action {
  @Body
  @V().Items([TestDto])
  private readonly b1!: TestDto[][];

  async invoke(): Promise<void> {
    this.ok();
  }
}

@V().Tags("test").Summary("summary")
export class StringArrayBody extends Action {
  @Body
  @V().Items(String)
  private readonly b1!: string[];

  async invoke(): Promise<void> {
    this.ok();
  }
}

@V().Tags("test").Summary("summary")
export class StringArrayParam extends Action {
  @Header
  @V().Items(String)
  private readonly h1!: string[];

  async invoke(): Promise<void> {
    this.ok();
  }
}

@V().Tags("test").Summary("summary")
export class ModelArrayParam extends Action {
  @Header
  @V().Items(String)
  private readonly h1!: TestDto[];

  async invoke(): Promise<void> {
    this.ok();
  }
}

@V().Tags("test").Summary("summary")
export class ParamStringArrayProperty extends Action {
  @Header
  private readonly h1!: StringArrayPropertyDto;

  async invoke(): Promise<void> {
    this.ok();
  }
}

@V().Tags("test").Summary("summary")
export class BodyModelArrayProperty extends Action {
  @Body
  private readonly b1!: ModelArrayPropertyDto;

  async invoke(): Promise<void> {
    this.ok();
  }
}

@V().Tags("test").Summary("summary")
export class ArrayBodyModelArrayProperty extends Action {
  @Body
  @V().Items(ModelArrayPropertyDto)
  private readonly b1!: ModelArrayPropertyDto[];

  async invoke(): Promise<void> {
    this.ok();
  }
}
