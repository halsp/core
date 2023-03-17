import { HttpMiddleware, HttpRequest } from "@halsp/http";
import { TestHttpStartup } from "@halsp/testing/dist/http";
import { Body } from "../src";

test("plain to class", async () => {
  class TestDto {
    h1!: string;
    h2!: number;

    get h() {
      return this.h1 + this.h2;
    }
  }
  class TestMiddleware extends HttpMiddleware {
    @Body
    private readonly body!: TestDto;

    async invoke(): Promise<void> {
      this.ok(this.body);
    }
  }

  const res = await new TestHttpStartup()
    .setContext(
      new HttpRequest().setBody({
        h1: "a",
        h2: 1,
      })
    )
    .useInject()
    .add(TestMiddleware)
    .run();

  const body = res.body as TestDto;
  expect(body.h).toBe("a1");
  expect(res.status).toBe(200);
});
