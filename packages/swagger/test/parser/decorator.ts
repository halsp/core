import { Body, Header, Query } from "@sfajs/pipe";
import { Action, HttpDelete, HttpPost, HttpPut } from "@sfajs/router";
import {
  Default,
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
  Schema,
  Xml,
  Format,
  Enum,
  ApiTags,
  Examples,
} from "../../src";
import {
  Ignore,
  Description,
  Required,
  LengthRange,
  Type,
  ApiCallback,
  ApiDeprecated,
  ApiExternalDocs,
  ApiDescription,
  ApiOperationId,
  ApiSummary,
  ApiSecurity,
  ApiResponses,
  ApiServers,
} from "../../src/decorators";

class TestClassDto {}

export class TestDecoratorHeaderDto {
  @Default("abc")
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
  @LengthRange({
    min: 10,
    max: 20,
  })
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
  @Schema((schema) => {
    schema.type = "number";
  })
  p5!: number;

  @Schema(TestClassDto)
  p6!: TestClassDto;

  @Schema(() => ({
    type: "number",
  }))
  p7!: string;

  @Xml({})
  p8!: string;

  @Format("int64")
  @Type("number")
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
  @Default("qqq")
  q1!: string;
}

@HttpPost("test")
@ApiTags("test")
@ApiCallback({
  cb: {},
})
@ApiExternalDocs({
  url: "https://sfajs.com",
})
@ApiDescription("desc")
@ApiOperationId("opt-id")
@ApiSummary("test summary")
@ApiSecurity({ jwt: ["123", "456"] })
@ApiResponses({
  "200": {
    a: 1,
  },
})
@ApiServers({
  url: "https://sfajs.com",
  description: "servers",
})
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
  @Default("p1")
  p1!: string;
}

@HttpDelete("test")
@ApiTags("test")
@ApiDeprecated()
export class IgnoreBodyTest extends Action {
  @Body
  private readonly b!: TestIgnoreTest;

  async invoke(): Promise<void> {
    this.ok();
  }
}
