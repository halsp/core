import { Body, Header, Query } from "@sfajs/pipe";
import { Action, HttpDelete, HttpPost, HttpPut } from "@sfajs/router";
import {
  Defaul,
  Pattern,
  ReadOnly,
  Title,
  WriteOnly,
  AllowEmptyValue,
  Example,
  NumRange,
  PropertiesRange,
  ParameterStyle,
  ArrayType,
  ParameterSchema,
  Xml,
  Format,
  Enum,
  ApiTags,
  Examples,
} from "../../src";
import { Ignore, Description, Required } from "../../src/decorators";

class TestClassDto {}

export class TestDecoratorHeaderDto {
  @Defaul("abc")
  @Title("title")
  @ReadOnly()
  @Pattern("^[a-z]$")
  @Example("def")
  @AllowEmptyValue()
  p1!: string;

  @Examples({
    abc: {
      description: "abc",
      value: "123",
    },
    def: {
      description: "def",
      value: 456,
    },
  })
  @WriteOnly()
  p2!: string;

  @Ignore()
  p3!: string;

  @PropertiesRange({
    min: 1,
    max: 10,
  })
  @NumRange({
    min: 1,
    max: 10,
  })
  p4!: number;

  @ParameterStyle("form")
  @ParameterSchema({
    type: "number",
  })
  p5!: number;

  @ParameterSchema(TestClassDto)
  p6!: TestClassDto;

  @ParameterSchema({
    type: "number",
  })
  p7!: string;

  @Xml({})
  p8!: string;

  @Format("int64")
  p9!: string;

  @Enum("abc", "def")
  p10!: string;
}

@Description("dto")
class TestDecoratorBodyDto {
  @ArrayType({
    type: "number",
  })
  @Description("def")
  p1!: number[];

  @ArrayType(TestClassDto)
  p2!: number[];

  @Required()
  @Description("abc")
  p3!: TestClassDto;
}

export class TestDecoratorQueryDto {
  @Ignore()
  @Defaul("qqq")
  q1!: string;
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

@HttpPut("test")
@ApiTags("test")
export class ParameterDecoratorTest extends Action {
  constructor(
    @Required()
    @Description("header constructor")
    @Header("hc")
    readonly hc: string,

    @Description("body constructor 1")
    @Body("bc1")
    readonly bc1: string,

    @Required()
    @Description("body constructor 2")
    @Body("bc2")
    readonly bc2: string,

    @Description("body constructor 3")
    @Ignore()
    readonly bc3: string
  ) {
    super();
  }
  async invoke(): Promise<void> {
    this.ok();
  }
}

@Ignore()
class TestIgnoreTest {
  @Defaul("p1")
  p1!: string;
}

@HttpDelete("test")
@ApiTags("test")
export class IgnoreBodyTest extends Action {
  @Body
  private readonly b!: TestIgnoreTest;

  async invoke(): Promise<void> {
    this.ok();
  }
}
