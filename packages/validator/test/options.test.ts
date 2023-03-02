import { Middleware, Request } from "@halsp/common";
import { Body } from "@halsp/pipe";
import "@halsp/inject";
import "../src";
import { UseValidatorOptions, V } from "../src";
import { TestStartup } from "@halsp/testing";

function testOptions(useOptions: any, decOptions: any, result: boolean) {
  test(`options test ${!!useOptions} ${!!decOptions} ${result}`, async () => {
    @UseValidatorOptions(decOptions)
    class TestDto {
      @V().IsInt()
      b1!: number;

      get b() {
        return this.b1;
      }
    }

    class TestMiddleware extends Middleware {
      @Body
      private readonly body!: TestDto;

      async invoke(): Promise<void> {
        this.ctx.set("result", this.body);
      }
    }

    const req = new Request().setBody({
      b1: null,
    });
    const startup = new TestStartup()
      .setSkipThrow()
      .setContext(req)
      .useInject()
      .useValidator(useOptions);
    const { ctx } = await startup.add(TestMiddleware).run();

    if (result) {
      expect(ctx.get<TestDto>("result").b).toBeNull();
      expect(ctx.errorStack.length).toBe(0);
    } else {
      expect(ctx.get("result")).toBeUndefined();
      expect(ctx.errorStack[0].message).toBe("b1 must be an integer number");
    }
  });
}

const options = {
  skipNullProperties: true,
};
testOptions(undefined, undefined, false);
testOptions(options, undefined, true);
testOptions(() => options, undefined, true);
testOptions(undefined, options, true);
testOptions(undefined, () => options, true);
testOptions(
  options,
  {
    skipNullProperties: false,
  },
  false
);
