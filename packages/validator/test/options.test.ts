import { Middleware, Request, TestStartup } from "@sfajs/core";
import { Body } from "@sfajs/pipe";
import { IsInt } from "class-validator";
import "@sfajs/inject";
import "../src";
import { UseValidatorOptions } from "../src";

function testOptions(useOptions: any, decOptions: any, result: boolean) {
  test(`options test ${!!useOptions} ${!!decOptions}`, async () => {
    @UseValidatorOptions(decOptions)
    class TestDto {
      @IsInt()
      b1!: number;

      get b() {
        return this.b1;
      }
    }

    class TestMiddleware extends Middleware {
      @Body
      private readonly body!: TestDto;

      async invoke(): Promise<void> {
        this.ok(this.body);
      }
    }

    const startup = new TestStartup(
      new Request().setBody({
        b1: null,
      })
    )
      .useInject()
      .useValidator(useOptions);
    const res = await startup.add(TestMiddleware).run();

    expect(res);
    if (result) {
      expect(res.status).toBe(200);
      expect(res.body.b).toBeNull();
    } else {
      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        message: "b1 must be an integer number",
        status: 400,
      });
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
