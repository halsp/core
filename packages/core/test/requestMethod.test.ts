import { HttpMethod, Startup } from "../src/index";
import Request from "../src/Request";

test("request method lower case", async function () {
  const startup = new Startup(
    new Request().setMethod(HttpMethod.post.toLowerCase())
  );

  expect(startup.ctx.req.method).toBe("POST");
});

test("request method upper case", async function () {
  const startup = new Startup(
    new Request().setMethod(HttpMethod.post.toUpperCase())
  );

  expect(startup.ctx.req.method).toBe("POST");
});
