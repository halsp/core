import { Middleware, TestStartup } from "sfa";
import "../src";

test("middleware class", async function () {
  class Md extends Middleware {
    async invoke(): Promise<void> {
      await this.view("ejs", {
        name: "test ejs",
      });
    }
  }

  const res = await new TestStartup()
    .useViews("test/views")
    .use(() => new Md())
    .run();

  expect(res.getHeader("content-type")).toBe("text/html");
  expect(res.status).toBe(200);
  expect(res.body).toBe("<p>test ejs</p>");
});

test("middleware class default", async function () {
  class Md extends Middleware {
    async invoke(): Promise<void> {
      await this.view();
    }
  }

  const res = await new TestStartup()
    .useViews("test/views")
    .use(() => new Md())
    .run();

  expect(res.status).toBe(404);
});
