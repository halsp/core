import { Body, Header } from "@ipare/pipe";
import { Action } from "@ipare/router";
import { S } from "../../src";

class TestDto {
  @S().Description("desc")
  b1?: string;
}

class StringArrayPropertyDto {
  @S().Description("desc").Items(String)
  b1?: string[];

  @S()
  b2?: TestDto;
}

class ModelArrayPropertyDto {
  @S().Description("desc").Items(TestDto)
  b1?: TestDto[];

  @S()
  b2?: TestDto;
}

@S().Tags("test").Summary("summary")
export class NotArray extends Action {
  @Body
  private readonly b1!: TestDto;

  async invoke(): Promise<void> {
    this.ok();
  }
}

@S().Tags("test").Summary("summary")
export class ArrayModel extends Action {
  @Body
  @S().Items(TestDto)
  private readonly b1!: TestDto[];

  async invoke(): Promise<void> {
    this.ok();
  }
}

@S().Tags("test").Summary("summary")
export class TwoDimensionalArray extends Action {
  @Body
  @S().Items([TestDto])
  private readonly b1!: TestDto[][];

  async invoke(): Promise<void> {
    this.ok();
  }
}

@S().Tags("test").Summary("summary")
export class StringArrayBody extends Action {
  @Body
  @S().Items(String)
  private readonly b1!: string[];

  async invoke(): Promise<void> {
    this.ok();
  }
}

@S().Tags("test").Summary("summary")
export class StringArrayParam extends Action {
  @Header
  @S().Items(String)
  private readonly h1!: string[];

  async invoke(): Promise<void> {
    this.ok();
  }
}

@S().Tags("test").Summary("summary")
export class ModelArrayParam extends Action {
  @Header
  @S().Items(String)
  private readonly h1!: TestDto[];

  async invoke(): Promise<void> {
    this.ok();
  }
}

@S().Tags("test").Summary("summary")
export class ParamStringArrayProperty extends Action {
  @Header
  private readonly h1!: StringArrayPropertyDto;

  async invoke(): Promise<void> {
    this.ok();
  }
}

@S().Tags("test").Summary("summary")
export class BodyModelArrayProperty extends Action {
  @Body
  private readonly b1!: ModelArrayPropertyDto;

  async invoke(): Promise<void> {
    this.ok();
  }
}

@S().Tags("test").Summary("summary")
export class ArrayBodyModelArrayProperty extends Action {
  @Body
  @S().Items(ModelArrayPropertyDto)
  private readonly b1!: ModelArrayPropertyDto[];

  async invoke(): Promise<void> {
    this.ok();
  }
}
