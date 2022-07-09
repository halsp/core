import { Body, Header, Query } from "@sfajs/pipe";
import { Action, HttpPost } from "@sfajs/router";
import {
  PropertyDefault,
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
import { Ignore, PropertyDescription } from "../../src/decorators";

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

  @Ignore()
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

  @PropertyParameterSchema({
    type: "number",
  })
  p7!: string;

  @PropertyXml({})
  p8!: string;

  @PropertyFormat("int64")
  p9!: string;

  @PropertyEnum("abc", "def")
  p10!: string;
}

class TestDecoratorBodyDto {
  @PropertyBodyArrayType({
    type: "number",
  })
  @PropertyDescription("def")
  p1!: number[];

  @PropertyBodyArrayType(TestClassDto)
  p2!: number[];

  @PropertyDescription("abc")
  p3!: TestClassDto;
}

@Ignore()
@Ignore()
export class TestDecoratorQueryDto {
  @PropertyDefault("abc")
  p1!: string;
}

@HttpPost("test")
@ApiTags("test")
export class TestDecorator extends Action {
  constructor(
    @PropertyDescription("header constructor") @Header("hc") readonly hc: string
  ) {
    super();
  }
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
