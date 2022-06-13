import { TestStartup, SfaRequest } from "@sfajs/core";
import "../src";
import "./global";

test("startup test", async () => {
  const result = await new TestStartup(
    new SfaRequest().setPath("/simple/RoUtEr").setMethod("POST")
  )
    .useTestRouter()
    .useRouter()
    .run();
  expect(result.status).toBe(200);
});

test("default", async () => {
  const result = await new TestStartup(
    new SfaRequest().setPath("").setMethod("GET")
  )
    .useTestRouter()
    .run();
  expect(result.status).toBe(200);
});

test("startup not exist", async () => {
  const result = await new TestStartup(
    new SfaRequest().setPath("/simple/router1").setMethod("POST")
  )
    .useTestRouter()
    .run();
  expect(result.status).toBe(404);
  expect(result.body).toEqual({
    message: "Can't find the path：simple/router1",
    path: "simple/router1",
    status: 404,
  });
});

test("shallow startup test", async () => {
  const res = await new TestStartup(
    new SfaRequest().setPath("/router").setMethod("POST")
  )
    .useTestRouter()
    .run();
  expect(res.status).toBe(200);
});

test("deep startup test", async () => {
  const result = await new TestStartup(
    new SfaRequest().setPath("/simple/deepActions/RoUtEr").setMethod("POST")
  )
    .useTestRouter()
    .run();
  expect(result.status).toBe(200);
});

test("null body test", async () => {
  const result = await new TestStartup(
    new SfaRequest().setPath("/nullbody").setMethod("PUT")
  )
    .useTestRouter()
    .run();

  expect(result.status).toBe(404);
});

test("blank config", async () => {
  const result = await new TestStartup(
    new SfaRequest().setPath("").setMethod("GET")
  )
    .useRouter()
    .run();
  expect(result.status).toBe(404);
});
