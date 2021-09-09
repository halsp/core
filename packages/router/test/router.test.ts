import { TestStartup, SfaRequest } from "sfa";
import "./UseTest";
import "../src";

test("startup test", async function () {
  const result = await new TestStartup(
    new SfaRequest().setPath("/simple/RoUtEr").setMethod("POST")
  )
    .useTest()
    .useRouter()
    .run();
  expect(result.status).toBe(200);
});

test("startup not exist", async function () {
  const result = await new TestStartup(
    new SfaRequest().setPath("/simple/router1").setMethod("POST")
  )
    .useTest()
    .useRouter()
    .run();
  expect(result.status).toBe(404);
});

test("shallow startup test", async function () {
  const result = await new TestStartup(
    new SfaRequest().setPath("/router").setMethod("POST")
  )
    .useTest()
    .useRouter()
    .run();
  expect(result.status).toBe(200);
});

test("deep startup test", async function () {
  const result = await new TestStartup(
    new SfaRequest().setPath("/simple/deepActions/RoUtEr").setMethod("POST")
  )
    .useTest()
    .useRouter()
    .run();
  expect(result.status).toBe(200);
});

test("strict test", async function () {
  let result = await new TestStartup(
    new SfaRequest().setPath("/simple/Router").setMethod("POST")
  )
    .useTest({ strict: false })
    .useRouter()
    .run();
  expect(result.status).toBe(200);

  result = await new TestStartup(
    new SfaRequest().setPath("/simple/Router").setMethod("POST")
  )
    .useTest({ strict: true })
    .useRouter()
    .run();
  expect(result.status).toBe(404);

  result = await new TestStartup(
    new SfaRequest().setPath("/restful").setMethod("PUT")
  )
    .useTest({ strict: false })
    .useRouter()
    .run();
  expect(result.status).toBe(200);

  result = await new TestStartup(
    new SfaRequest().setPath("/restful").setMethod("PUT")
  )
    .useTest({ strict: true })
    .useRouter()
    .run();
  expect(result.status).toBe(200);
});

test("null body test", async function () {
  const result = await new TestStartup(
    new SfaRequest().setPath("/nullbody").setMethod("PUT")
  )
    .useTest()
    .useRouter()
    .run();

  expect(result.status).toBe(404);
});
