import { HttpMethod } from "../src/index";
import Request from "../src/Request";
import TestStartup from "./TestStartup";

test("request method lower case", async function () {
  const startup = new TestStartup(
    new Request().setMethod(HttpMethod.post.toLowerCase())
  );

  expect(startup.ctx.req.method).toBe("POST");
});

test("request method upper case", async function () {
  const startup = new TestStartup(
    new Request().setMethod(HttpMethod.post.toUpperCase())
  );

  expect(startup.ctx.req.method).toBe("POST");
});
