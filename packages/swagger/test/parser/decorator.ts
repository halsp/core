import { Body, Header, Query } from "@ipare/pipe";
import { Action, HttpDelete, HttpPost, HttpPut } from "@ipare/router";
import { S } from "../../src";

class TestClassDto {}

export class TestDecoratorHeaderDto {
  @S()
    .Default("abc")
    .Title("title")
    .ReadOnly()
    .Matches("^[a-z]$")
    .Example("def")
    .IsOptional()
  p1!: string;

  @S().Examples({
    abc: {
      description: "abc",
      value: "123",
    },
    def: {
      description: "def",
      value: 456,
    },
  })
  @S().WriteOnly().Min(10).Max(20)
  p2!: string;

  @S().Ignore()
  p3!: string;

  @S().MinProperties(1).MaxProperties(10).Min(1).Max(10)
  p4!: number;

  @S().Style("form")
  p5!: number;

  p7!: string;

  @S().Xml({})
  p8!: string;

  @S().IsInt()
  p9!: string;

  @S().Enum("abc", "def")
  p10!: string;
}

@S().Description("dto")
class TestDecoratorBodyDto {
  constructor(
    @S().Description("invalid")
    readonly invalid: string
  ) {}

  @S().Items({
    type: "number",
  })
  @S().Description("def")
  p1!: number[];

  @S().Items(TestClassDto)
  p2!: number[];

  @S().Required().Description("abc")
  p3!: TestClassDto;
}

export class TestDecoratorQueryDto {
  @S().Ignore()
  @S().Default("qqq")
  q1!: string;
}

@HttpPost("test")
@S().Tags("test")
@S()
  .ExternalDocs({
    url: "https://ipare.org",
  })
  .Description("desc")
  .OperationId("opt-id")
  .Summary("test summary")
  .Security({ jwt: ["123", "456"] })
@S().Servers({
  url: "https://ipare.org",
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
@S().Tags("test")
export class ParameterDecoratorTest extends Action {
  constructor(
    @S().Required().Description("header constructor")
    @Header("hc")
    readonly hc: string,

    @S().Description("body constructor 1")
    @Body("bc1")
    readonly bc1: string,

    @S().Required().Description("body constructor 2")
    @Body("bc2")
    readonly bc2: string,

    @S().Description("body constructor 3").Ignore()
    @Body("bc3")
    readonly bc3: string
  ) {
    super();
  }
  async invoke(): Promise<void> {
    this.ok();
  }
}

@S().Ignore()
class TestIgnoreTest {
  @S().Default("p1")
  p1!: string;
}

@HttpDelete("test")
@S().Tags("test").Deprecated()
export class IgnoreBodyTest extends Action {
  @Body
  private readonly b!: TestIgnoreTest;

  async invoke(): Promise<void> {
    this.ok();
  }
}
