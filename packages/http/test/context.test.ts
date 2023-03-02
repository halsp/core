import { Context } from "@halsp/common";
import { HttpMethods } from "@halsp/methods";
import "../src";
import { initContext } from "../src/context";

describe("context", () => {
  it("default instance", async () => {
    const ctx = new Context();
    expect(ctx.req).not.toBeUndefined();
    expect(ctx.res).not.toBeUndefined();
  });

  it("should set req", async () => {
    const ctx = new Context();
    expect(ctx).toBe(ctx.req.ctx);
  });

  it("should set res", async () => {
    const ctx = new Context();
    expect(ctx).toBe(ctx.res.ctx);
  });

  it("should skip init multiple", async () => {
    initContext();
    initContext();

    const ctx = new Context();
    expect(ctx).toBe(ctx.res.ctx);
  });
});

describe("default res", () => {
  it("should set default res.headers to be {}", async () => {
    const ctx = new Context();
    expect(ctx.res.headers).toEqual({});
  });

  it("should set default res.body to be undefined", async () => {
    const ctx = new Context();
    expect(ctx.res.body).toBeUndefined();
  });

  it("should set default res.status to be 404", async () => {
    const ctx = new Context();
    expect(ctx.res.status).toBe(404);
  });

  it("should set default res.isSuccess to be false", async () => {
    const ctx = new Context();
    expect(ctx.res.isSuccess).toBe(false);
  });
});

describe("default req", () => {
  it("should set default req.headers to be {}", async () => {
    const ctx = new Context();
    expect(ctx.req.headers).toEqual({});
  });

  it("should set default req.query to be {}", async () => {
    const ctx = new Context();
    expect(ctx.req.query).toEqual({});
  });

  it("should set default req.body to be undefined", async () => {
    const ctx = new Context();
    expect(ctx.req.body).toBeUndefined();
  });

  it("should set default req.overrideMethod to be undefined", async () => {
    const ctx = new Context();
    expect(ctx.req.overrideMethod).toBeUndefined();
  });

  it("should set default req.isSuccess to be false", async () => {
    const ctx = new Context();
    expect(ctx.res.isSuccess).toBe(false);
  });

  it("should set default req.method to be ANY", async () => {
    const ctx = new Context();
    expect(ctx.req.method).toBe(HttpMethods.any);
  });
});
