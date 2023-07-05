import { Body, Header, Query } from "@halsp/pipe";
import { Action, HttpDelete, HttpPost, HttpPut } from "@halsp/router";
import { V } from "../../src";

class TestClassDto {}

export class TestDecoratorHeaderDto {
  @V.Default("abc")
    .Title("title")
    .ReadOnly()
    .Matches("^[a-z]$")
    .Example("def")
    .IsOptional()
  p1!: string;

  @V.Examples({
    abc: {
      description: "abc",
      value: "123",
    },
    def: {
      description: "def",
      value: 456,
    },
  })
  @V.WriteOnly().Min(10).Max(20)
  p2!: string;

  @V.Ignore().Format("date")
  p3!: string;

  @V.MinProperties(1).MaxProperties(10).Min(1).Max(10)
  p4!: number;

  @V.Style("form")
  p5!: number;

  p7!: string;

  @V.Xml({})
  p8!: string;

  @V.IsInt()
  p9!: string;

  @V.Enum("abc", "def")
  p10!: string;
}

@V.Description("dto")
class TestDecoratorBodyDto {
  constructor(
    @V.Description("invalid")
    readonly invalid: string
  ) {}

  @V.Items({
    type: "number",
  })
  @V.Description("def")
  p1!: number[];

  @V.Items(TestClassDto)
  p2!: number[];

  @V.Items(Number)
  p3!: number[];

  @V.Required().Description("abc")
  p4!: TestClassDto;
}

export class TestDecoratorQueryDto {
  @V.Ignore()
  @V.Default("qqq")
  q1!: string;
}

@HttpPost("test")
@V.Tags("test")
@V.ExternalDocs({
  url: "https://halsp.org",
})
  .Description("desc")
  .OperationId("opt-id")
  .Summary("test summary")
  .Security({ jwt: ["123", "456"] })
@V.Servers({
  url: "https://halsp.org",
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
@V.Tags("test")
export class ParameterDecoratorTest extends Action {
  constructor(
    @V.Required().Description("header constructor")
    @Header("hc")
    readonly hc: string,

    @V.Description("body constructor 1")
    @Body("bc1")
    readonly bc1: string,

    @V.Required().Description("body constructor 2")
    @Body("bc2")
    readonly bc2: string,

    @V.Description("body constructor 3").Ignore()
    @Body("bc3")
    readonly bc3: string
  ) {
    super();
  }
  async invoke(): Promise<void> {
    this.ok();
  }
}

@V.Ignore()
class TestIgnoreTest {
  @V.Default("p1")
  p1!: string;
}

@HttpDelete("test")
@V.Tags("test").Deprecated()
export class IgnoreBodyTest extends Action {
  @Body
  private readonly b!: TestIgnoreTest;

  async invoke(): Promise<void> {
    this.ok();
  }
}
