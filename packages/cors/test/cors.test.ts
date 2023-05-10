import { HttpMethods } from "@halsp/methods";
import { Request, Startup } from "@halsp/core";
import "@halsp/testing";
import "../src";

it("default options", async () => {
  const res = await new Startup().useHttp().useCors().test();
  expect(res.getHeader("Access-Control-Allow-Origin")).toBeUndefined();
  expect(res.getHeader("Vary")).toBe("Origin");
  expect(res.status).toBe(404);
});

it("should set 'Access-Control-Allow-Origin'", async () => {
  const res = await new Startup()
    .useHttp()
    .setContext(new Request().setHeader("Origin", "https://halsp.org"))
    .useCors()
    .test();

  expect(res.getHeader("Access-Control-Allow-Origin")).toBe(
    "https://halsp.org"
  );
});

it("should not set 'Access-Control-Allow-Origin' when method is OPTIONS and no 'Access-Control-Request-Metho'", async () => {
  const res = await new Startup()
    .useHttp()
    .setContext(
      new Request()
        .setHeader("Origin", "https://halsp.org")
        .setMethod(HttpMethods.options)
    )
    .useCors()
    .test();

  expect(res.getHeader("Access-Control-Allow-Origin")).toBeUndefined();
});

it("should set status to 204 when method is OPTIONS", async () => {
  const res = await new Startup()
    .useHttp()
    .setContext(
      new Request()
        .setHeader("Origin", "https://halsp.org")
        .setHeader("Access-Control-Request-Method", "POST")
        .setMethod(HttpMethods.options)
    )
    .useCors()
    .test();

  expect(res.status).toBe(204);
});
