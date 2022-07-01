import { Body, Header } from "@sfajs/pipe";
import { Action } from "@sfajs/router";
import {
  PropertyDefault,
  PropertyIgnore,
  PropertyPattern,
  PropertyReadOnly,
  PropertyTitle,
  PropertyWriteOnly,
  PropertyAllowEmptyValue,
  PropertyExample,
  PropertyNumRange,
  PropertyPropertiesRange,
  PropertyParameterStyle,
  PropertyBodyArrayType,
  PropertyParameterSchema,
} from "../../src";

class TestClassDto {}

export class TestDecoratorHeaderDto {
  @PropertyDefault("abc")
  @PropertyTitle("title")
  @PropertyReadOnly()
  @PropertyPattern("^[a-z]$")
  @PropertyExample("def")
  @PropertyExample(["ghi", "jkl"])
  @PropertyAllowEmptyValue()
  p1!: string;

  @PropertyWriteOnly()
  p2!: string;

  @PropertyIgnore()
  p3!: string;

  @PropertyPropertiesRange({
    min: 1,
    max: 10,
  })
  @PropertyNumRange({
    min: 1,
    max: 10,
  })
  p4!: number;

  @PropertyParameterStyle("form")
  @PropertyParameterSchema({
    type: "number",
  })
  p5!: number;

  @PropertyParameterSchema(TestClassDto)
  p6!: TestClassDto;
}

class TestDecoratorBodyDto {
  @PropertyBodyArrayType({
    type: "number",
  })
  p1!: number[];

  @PropertyBodyArrayType(TestClassDto)
  p2!: number[];

  @PropertyParameterSchema({
    type: "number",
  })
  p3!: string;
}

export class TestDecorator extends Action {
  @Header
  private readonly h!: TestDecoratorHeaderDto;
  @Body
  private readonly b!: TestDecoratorBodyDto;

  async invoke(): Promise<void> {
    this.ok();
  }
}
