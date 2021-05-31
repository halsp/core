import { Startup, Request } from "sfa";
import "./UseTest";
import "../src";

test("startup test", async function () {
  const result = await new Startup(
    new Request().setPath("/simple/RoUtEr").setMethod("POST")
  )
    .useTest()
    .useRouter()
    .invoke();
  expect(result.status).toBe(200);
});

test("startup not exist", async function () {
  const result = await new Startup(
    new Request().setPath("/simple/router1").setMethod("POST")
  )
    .useTest()
    .useRouter()
    .invoke();
  expect(result.status).toBe(404);
});

test("shallow startup test", async function () {
  const result = await new Startup(
    new Request().setPath("/router").setMethod("POST")
  )
    .useTest()
    .useRouter()
    .invoke();
  expect(result.status).toBe(200);
});

test("deep startup test", async function () {
  const result = await new Startup(
    new Request().setPath("/simple/deepActions/RoUtEr").setMethod("POST")
  )
    .useTest()
    .useRouter()
    .invoke();
  expect(result.status).toBe(200);
});

test("strict test", async function () {
  let result = await new Startup(
    new Request().setPath("/simple/Router").setMethod("POST")
  )
    .useTest({ strict: false })
    .useRouter()
    .invoke();
  expect(result.status).toBe(200);

  result = await new Startup(
    new Request().setPath("/simple/Router").setMethod("POST")
  )
    .useTest({ strict: true })
    .useRouter()
    .invoke();
  expect(result.status).toBe(404);

  result = await new Startup(new Request().setPath("/restful").setMethod("PUT"))
    .useTest({ strict: false })
    .useRouter()
    .invoke();
  expect(result.status).toBe(200);

  result = await new Startup(new Request().setPath("/restful").setMethod("PUT"))
    .useTest({ strict: true })
    .useRouter()
    .invoke();
  expect(result.status).toBe(200);
});

test("null body test", async function () {
  const result = await new Startup(
    new Request().setPath("/nullbody").setMethod("PUT")
  )
    .useTest()
    .useRouter()
    .invoke();

  expect(result.status).toBe(404);
});
