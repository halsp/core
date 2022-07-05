import { Middleware, SfaRequest, TestStartup } from "@sfajs/core";
import { Body } from "@sfajs/pipe";
import "@sfajs/inject";
import "../src";
import { IsInt, IsString } from "class-validator";

function runTest(validate: boolean) {
  test("validate", async () => {
    class TestDto {
      b1!: string;

      @IsInt()
      b2!: number;

      get b() {
        return this.b1 + this.b2;
      }
    }

    class TestMiddleware extends Middleware {
      @Body
      private readonly body!: TestDto;

      async invoke(): Promise<void> {
        this.ok(this.body);
      }
    }

    const res = await new TestStartup(
      new SfaRequest().setBody({
        b1: "a",
        b2: validate ? 1 : "1",
      })
    )
      .useInject()
      .useValidator()
      .add(TestMiddleware)
      .run();

    const body = res.body as TestDto;
    if (validate) {
      expect(body.b).toBe("a1");
      expect(res.status).toBe(200);
    } else {
      expect(res.status).toBe(400);
      expect(body).toEqual({
        status: 400,
        message: "b2 must be an integer number",
      });
    }
  });
}

runTest(true);
runTest(false);

test("array message", async () => {
  class TestDto {
    @IsString()
    b1!: string;

    @IsInt()
    b2!: number;

    get b() {
      return this.b1 + this.b2;
    }
  }

  class TestMiddleware extends Middleware {
    @Body
    private readonly body!: TestDto;

    async invoke(): Promise<void> {
      this.ok(this.body);
    }
  }

  const res = await new TestStartup(
    new SfaRequest().setBody({
      b1: 1,
      b2: "1",
    })
  )
    .useInject()
    .useValidator()
    .add(TestMiddleware)
    .run();

  const body = res.body as TestDto;
  expect(res.status).toBe(400);
  expect(body).toEqual({
    status: 400,
    message: ["b1 must be a string", "b2 must be an integer number"],
  });
});

test("validate disabled", async () => {
  class TestMiddleware extends Middleware {
    @Body
    b!: Record<string, any>;

    async invoke(): Promise<void> {
      this.ok();
    }
  }

  const res = await new TestStartup(
    new SfaRequest().setBody({
      b1: 1,
    })
  )
    .useInject()
    .useValidator()
    .add(TestMiddleware)
    .run();

  expect(res.status).toBe(200);
});
