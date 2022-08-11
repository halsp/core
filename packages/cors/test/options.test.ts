import { TestStartup } from "@ipare/testing";
import { HttpMethod, Request } from "@ipare/core";
import "../src";

it("should set headers when set options of empty origin", async () => {
  const res = await new TestStartup(
    new Request().setHeader("Origin", "https://ipare.org")
  )
    .useCors({
      origin: () => "",
    })
    .run();
  expect(res.getHeader("Access-Control-Allow-Origin")).toBeUndefined();
  expect(res.status).toBe(404);
});

it("should set Access-Control-Allow-Credentials when set credentials true", async () => {
  const res = await new TestStartup(
    new Request().setHeader("Origin", "https://ipare.org")
  )
    .useCors({
      credentials: () => true,
    })
    .run();
  expect(res.getHeader("Access-Control-Allow-Credentials")).toBe("true");
});

it("should set Access-Control-Allow-Headers when set allowHeaders option", async () => {
  const res = await new TestStartup(
    new Request()
      .setHeader("Origin", "https://ipare.org")
      .setHeader("Access-Control-Request-Method", "POST")
      .setMethod(HttpMethod.options)
  )
    .useCors({
      allowHeaders: ["get"],
    })
    .run();
  expect(res.getHeader("Access-Control-Allow-Headers")).toEqual(["get"]);
});

it("should not set Access-Control-Request-Private-Network when privateNetworkAccess is false", async () => {
  const res = await new TestStartup(
    new Request()
      .setHeader("Origin", "https://ipare.org")
      .setHeader("Access-Control-Request-Method", "POST")
      .setMethod(HttpMethod.options)
  )
    .useCors({
      privateNetworkAccess: false,
    })
    .run();
  expect(res.hasHeader("Access-Control-Allow-Methods")).toBeFalsy();
});

it("should not set Access-Control-Request-Private-Network if Access-Control-Request-Private-Network not exist", async () => {
  const res = await new TestStartup(
    new Request()
      .setHeader("Origin", "https://ipare.org")
      .setHeader("Access-Control-Request-Method", "POST")
      .setMethod(HttpMethod.options)
  )
    .useCors({
      privateNetworkAccess: true,
    })
    .run();
  expect(res.hasHeader("Access-Control-Allow-Methods")).toBeFalsy();
});

it("should set Access-Control-Request-Private-Network", async () => {
  const res = await new TestStartup(
    new Request()
      .setHeader("Origin", "https://ipare.org")
      .setHeader("Access-Control-Request-Method", "POST")
      .setHeader("Access-Control-Request-Private-Network", "true")
      .setMethod(HttpMethod.options)
  )
    .useCors({
      privateNetworkAccess: true,
    })
    .run();
  expect(res.hasHeader("Access-Control-Allow-Methods")).toBeFalsy();
});
