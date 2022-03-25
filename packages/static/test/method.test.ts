import { TestStartup, SfaRequest } from "@sfajs/core";
import "../src";

test("method", async function () {
  {
    const result = await new TestStartup(new SfaRequest().setMethod("GET"))
      .useStatic({
        dir: "test/static",
      })
      .run();
    expect(result.status).toBe(200);
  }
  {
    const result = await new TestStartup(new SfaRequest().setMethod("POST"))
      .useStatic({
        dir: "test/static",
        method: "GET",
      })
      .run();
    expect(result.status).toBe(404);
  }
  {
    const result = await new TestStartup(new SfaRequest())
      .useStatic({
        dir: "test/static",
      })
      .run();
    expect(result.status).toBe(404);
  }
});

test("single method", async function () {
  {
    const result = await new TestStartup(
      new SfaRequest().setMethod("get").setPath("ind")
    )
      .useStatic({
        file: "test/static/index.html",
        reqPath: "ind",
      })
      .run();
    expect(result.status).toBe(200);
  }
  {
    const result = await new TestStartup(new SfaRequest().setPath("ind"))
      .useStatic({
        file: "test/static/index.html",
        reqPath: "ind",
      })
      .run();
    expect(result.status).toBe(404);
  }
});

test("custom method", async function () {
  {
    const result = await new TestStartup(
      new SfaRequest().setMethod("head").setPath("ind")
    )
      .useStatic({
        file: "test/static/index.html",
        reqPath: "ind",
        method: "HEAD",
      })
      .run();
    expect(result.status).toBe(200);
  }
  {
    const result = await new TestStartup(new SfaRequest().setMethod("HEAD"))
      .useStatic({
        dir: "test/static",
        method: "HEAD",
      })
      .run();
    expect(result.status).toBe(200);
  }
});

test("array method", async function () {
  {
    const result = await new TestStartup(
      new SfaRequest().setMethod("head").setPath("ind")
    )
      .useStatic({
        file: "test/static/index.html",
        reqPath: "ind",
        method: ["HEAD"],
      })
      .run();
    expect(result.status).toBe(200);
  }
  {
    const result = await new TestStartup(new SfaRequest().setMethod("HEAD"))
      .useStatic({
        dir: "test/static",
        method: ["HEAD"],
      })
      .run();
    expect(result.status).toBe(200);
  }
});

test("any method", async function () {
  {
    const result = await new TestStartup(new SfaRequest().setMethod("HEAD"))
      .useStatic({
        dir: "test/static",
        method: ["ANY"],
      })
      .run();
    expect(result.status).toBe(200);
  }
  {
    const result = await new TestStartup(new SfaRequest().setMethod("HEAD"))
      .useStatic({
        dir: "test/static",
        method: "ANY",
      })
      .run();
    expect(result.status).toBe(200);
  }
});
