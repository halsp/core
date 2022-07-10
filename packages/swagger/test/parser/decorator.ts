import { Body, Header, Query } from "@sfajs/pipe";
import { Action, HttpDelete, HttpPost, HttpPut } from "@sfajs/router";
import {
  DtoDefault,
  DtoPattern,
  DtoReadOnly,
  DtoTitle,
  DtoWriteOnly,
  DtoAllowEmptyValue,
  DtoExample,
  DtoNumRange,
  DtoPropertiesRange,
  DtoParameterStyle,
  DtoArrayType,
  DtoSchema,
  DtoXml,
  DtoFormat,
  DtoEnum,
  ApiTags,
  DtoExamples,
  DtoIgnore,
  DtoDescription,
  DtoRequired,
  DtoLengthRange,
  DtoType,
  ApiCallback,
  ApiDeprecated,
  ApiExternalDocs,
  ApiDescription,
  ApiOperationId,
  ApiSummary,
  ApiSecurity,
  ApiResponses,
  ApiServers,
} from "../../src";

class TestClassDto {}

export class TestDecoratorHeaderDto {
  @DtoDefault("abc")
  @DtoTitle("title")
  @DtoReadOnly()
  @DtoPattern("^[a-z]$")
  @DtoExample("def")
  @DtoAllowEmptyValue()
  p1!: string;

  @DtoExamples({
    abc: {
      description: "abc",
      value: "123",
    },
    def: {
      description: "def",
      value: 456,
    },
  })
  @DtoWriteOnly()
  @DtoLengthRange({
    min: 10,
    max: 20,
  })
  p2!: string;

  @DtoIgnore()
  p3!: string;

  @DtoPropertiesRange({
    min: 1,
    max: 10,
  })
  @DtoNumRange({
    min: 1,
    max: 10,
  })
  p4!: number;

  @DtoParameterStyle("form")
  @DtoSchema((schema) => {
    schema.type = "number";
  })
  p5!: number;

  @DtoSchema(TestClassDto)
  p6!: TestClassDto;

  @DtoSchema(() => ({
    type: "number",
  }))
  p7!: string;

  @DtoXml({})
  p8!: string;

  @DtoFormat("int64")
  @DtoType("number")
  p9!: string;

  @DtoEnum("abc", "def")
  p10!: string;
}

@DtoDescription("dto")
class TestDecoratorBodyDto {
  constructor(
    @DtoDescription("invalid")
    readonly invalid: string
  ) {}

  @DtoArrayType({
    type: "number",
  })
  @DtoDescription("def")
  p1!: number[];

  @DtoArrayType(TestClassDto)
  p2!: number[];

  @DtoRequired()
  @DtoDescription("abc")
  p3!: TestClassDto;
}

export class TestDecoratorQueryDto {
  @DtoIgnore()
  @DtoDefault("qqq")
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
    @DtoRequired()
    @DtoDescription("header constructor")
    @Header("hc")
    readonly hc: string,

    @DtoDescription("body constructor 1")
    @Body("bc1")
    readonly bc1: string,

    @DtoRequired()
    @DtoDescription("body constructor 2")
    @Body("bc2")
    readonly bc2: string,

    @DtoDescription("body constructor 3")
    @DtoIgnore()
    @Body("bc3")
    readonly bc3: string
  ) {
    super();
  }
  async invoke(): Promise<void> {
    this.ok();
  }
}

@DtoIgnore()
class TestIgnoreTest {
  @DtoDefault("p1")
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
