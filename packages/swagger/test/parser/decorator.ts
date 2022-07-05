import { Body, Header, Query } from "@sfajs/pipe";
import { Action, HttpPost } from "@sfajs/router";
import { SchemaObject } from "openapi3-ts";
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
  PropertyXml,
  PropertyFormat,
  PropertyEnum,
  ApiTags,
  PropertyExamples,
} from "../../src";
import { ModelIgnore } from "../../src/decorators/model.decorator";

class TestClassDto {}

export class TestDecoratorHeaderDto {
  @PropertyDefault("abc")
  @PropertyTitle("title")
  @PropertyReadOnly()
  @PropertyPattern("^[a-z]$")
  @PropertyExample("def")
  @PropertyAllowEmptyValue()
  p1!: string;

  @PropertyExamples({
    abc: {
      description: "abc",
      value: "123",
    },
    def: {
      description: "def",
      value: 456,
    },
  })
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

  @PropertyXml({})
  p7!: string;

  @PropertyFormat("int64")
  p8!: string;

  @PropertyEnum("abc", "def")
  p9!: string;
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

@ModelIgnore()
@ModelIgnore()
export class TestDecoratorQueryDto {
  @PropertyDefault("abc")
  p1!: string;
}

@HttpPost("test")
@ApiTags("test")
export class TestDecorator extends Action {
  @Header
  private readonly h!: TestDecoratorHeaderDto;
  @Body
  private readonly b!: TestDecoratorBodyDto;
  @Query
  private readonly q!: TestDecoratorQueryDto;

  async invoke(): Promise<void> {
    this.ok();
  }
}
