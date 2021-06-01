import { HttpMethod } from "../src/index";
import Request from "../src/Request";
import { SimpleStartup } from "../src";

test("request method lower case", async function () {
  const startup = new SimpleStartup(
    new Request().setMethod(HttpMethod.post.toLowerCase())
  );

  expect(startup.ctx.req.method).toBe("POST");
});

test("request method upper case", async function () {
  const startup = new SimpleStartup(
    new Request().setMethod(HttpMethod.post.toUpperCase())
  );

  expect(startup.ctx.req.method).toBe("POST");
});
