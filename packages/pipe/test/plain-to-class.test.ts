import { Middleware, Request, Startup } from "@halsp/core";
import "@halsp/http";
import "@halsp/testing";
import { Body } from "../src";

test("plain to class", async () => {
  class TestDto {
    h1!: string;
    h2!: number;

    get h() {
      return this.h1 + this.h2;
    }
  }
  class TestMiddleware extends Middleware {
    @Body
    private readonly body!: TestDto;

    async invoke(): Promise<void> {
      this.ok(this.body);
    }
  }

  const res = await new Startup()
    .useHttp()
    .setContext(
      new Request().setBody({
        h1: "a",
        h2: 1,
      })
    )
    .useInject()
    .add(TestMiddleware)
    .test();

  const body = res.body as TestDto;
  expect(body.h).toBe("a1");
  expect(res.status).toBe(200);
});
