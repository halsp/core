import { TestHttpStartup } from "@halsp/testing/dist/http";
import { HttpMethods } from "@halsp/methods";
import { Request } from "@halsp/common";
import "../src";

it("should set cors headers when options.origin is empty string", async () => {
  const res = await new TestHttpStartup()
    .setContext(new Request().set("Origin", "https://halsp.org"))
    .useCors({
      origin: () => "",
    })
    .run();
  expect(res.get("Access-Control-Allow-Origin")).toBeUndefined();
  expect(res.status).toBe(404);
});

it("should set Access-Control-Allow-Credentials when credentials is true", async () => {
  const res = await new TestHttpStartup()
    .setContext(new Request().set("Origin", "https://halsp.org"))
    .useCors({
      credentials: () => true,
    })
    .run();
  expect(res.get("Access-Control-Allow-Credentials")).toBe("true");
});

it("should set Access-Control-Allow-Headers when set allowHeaders option", async () => {
  const res = await new TestHttpStartup()
    .setContext(
      new Request()
        .set("Origin", "https://halsp.org")
        .set("Access-Control-Request-Method", "POST")
        .setMethod(HttpMethods.options)
    )
    .useCors({
      allowHeaders: ["get"],
    })
    .run();
  expect(res.get("Access-Control-Allow-Headers")).toEqual(["get"]);
});

describe("privateNetworkAccess", () => {
  it("should not set Access-Control-Request-Private-Network when privateNetworkAccess is false", async () => {
    const res = await new TestHttpStartup()
      .setContext(
        new Request()
          .set("Origin", "https://halsp.org")
          .set("Access-Control-Request-Method", "POST")
          .setMethod(HttpMethods.options)
      )
      .useCors({
        privateNetworkAccess: false,
      })
      .run();
    expect(res.has("Access-Control-Allow-Private-Network")).toBeFalsy();
  });

  it("should not set Access-Control-Request-Private-Network if Access-Control-Request-Private-Network not exist", async () => {
    const res = await new TestHttpStartup()
      .setContext(
        new Request()
          .set("Origin", "https://halsp.org")
          .set("Access-Control-Request-Method", "POST")
          .setMethod(HttpMethods.options)
      )
      .useCors({
        privateNetworkAccess: true,
      })
      .run();
    expect(res.has("Access-Control-Allow-Private-Network")).toBeFalsy();
  });

  it("should set Access-Control-Request-Private-Network", async () => {
    const res = await new TestHttpStartup()
      .setContext(
        new Request()
          .set("Origin", "https://halsp.org")
          .set("Access-Control-Request-Method", "POST")
          .set("Access-Control-Request-Private-Network", "true")
          .setMethod(HttpMethods.options)
      )
      .useCors({
        privateNetworkAccess: true,
      })
      .run();
    expect(res.has("Access-Control-Allow-Private-Network")).toBeTruthy();
  });
});

describe("allowMethods", () => {
  it("should not set Access-Control-Allow-Methods when the method is not OPTIONS", async () => {
    const res = await new TestHttpStartup()
      .setContext(new Request().set("Origin", "https://halsp.org"))
      .useCors()
      .run();
    expect(res.get("Access-Control-Allow-Methods")).toBeUndefined();
  });

  it("should set default Access-Control-Allow-Methods", async () => {
    const res = await new TestHttpStartup()
      .setContext(
        new Request()
          .set("Origin", "https://halsp.org")
          .set("Access-Control-Request-Method", "POST")
          .setMethod(HttpMethods.options)
      )
      .useCors()
      .run();
    expect(res.get("Access-Control-Allow-Methods")).toEqual([
      "GET",
      "HEAD",
      "PUT",
      "POST",
      "DELETE",
      "PATCH",
    ]);
  });

  it("should set Access-Control-Allow-Methods when set allowMethods option", async () => {
    const allowMethods = ["POST"];
    const res = await new TestHttpStartup()
      .setContext(
        new Request()
          .set("Origin", "https://halsp.org")
          .set("Access-Control-Request-Method", "POST")
          .setMethod(HttpMethods.options)
      )
      .useCors({
        allowMethods,
      })
      .run();
    expect(res.get("Access-Control-Allow-Methods")).toEqual(allowMethods);
  });
});
