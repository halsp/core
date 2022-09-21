import { HttpMethod, Request } from "@ipare/http";
import { TestHttpStartup } from "@ipare/testing";
import "../src";

it("default options", async () => {
  const res = await new TestHttpStartup().useCors().run();
  expect(res.getHeader("Access-Control-Allow-Origin")).toBeUndefined();
  expect(res.getHeader("Vary")).toBe("Origin");
  expect(res.status).toBe(404);
});

it("should set 'Access-Control-Allow-Origin'", async () => {
  const res = await new TestHttpStartup()
    .setRequest(new Request().setHeader("Origin", "https://ipare.org"))
    .useCors()
    .run();

  expect(res.getHeader("Access-Control-Allow-Origin")).toBe(
    "https://ipare.org"
  );
});

it("should not set 'Access-Control-Allow-Origin' when method is OPTIONS and no 'Access-Control-Request-Metho'", async () => {
  const res = await new TestHttpStartup()
    .setRequest(
      new Request()
        .setHeader("Origin", "https://ipare.org")
        .setMethod(HttpMethod.options)
    )
    .useCors()
    .run();

  expect(res.getHeader("Access-Control-Allow-Origin")).toBeUndefined();
});

it("should set status to 204 when method is OPTIONS", async () => {
  const res = await new TestHttpStartup()
    .setRequest(
      new Request()
        .setHeader("Origin", "https://ipare.org")
        .setHeader("Access-Control-Request-Method", "POST")
        .setMethod(HttpMethod.options)
    )
    .useCors()
    .run();

  expect(res.status).toBe(204);
});
