import { SimpleStartup, Request } from "sfa";
import "./UseTest";
import "../src";

test("startup test", async function () {
  const result = await new SimpleStartup(
    new Request().setPath("/simple/RoUtEr").setMethod("POST")
  )
    .useTest()
    .useRouter<SimpleStartup>()
    .run();
  expect(result.status).toBe(200);
});

test("startup not exist", async function () {
  const result = await new SimpleStartup(
    new Request().setPath("/simple/router1").setMethod("POST")
  )
    .useTest()
    .useRouter<SimpleStartup>()
    .run();
  expect(result.status).toBe(404);
});

test("shallow startup test", async function () {
  const result = await new SimpleStartup(
    new Request().setPath("/router").setMethod("POST")
  )
    .useTest()
    .useRouter<SimpleStartup>()
    .run();
  expect(result.status).toBe(200);
});

test("deep startup test", async function () {
  const result = await new SimpleStartup(
    new Request().setPath("/simple/deepActions/RoUtEr").setMethod("POST")
  )
    .useTest()
    .useRouter<SimpleStartup>()
    .run();
  expect(result.status).toBe(200);
});

test("strict test", async function () {
  let result = await new SimpleStartup(
    new Request().setPath("/simple/Router").setMethod("POST")
  )
    .useTest({ strict: false })
    .useRouter<SimpleStartup>()
    .run();
  expect(result.status).toBe(200);

  result = await new SimpleStartup(
    new Request().setPath("/simple/Router").setMethod("POST")
  )
    .useTest({ strict: true })
    .useRouter<SimpleStartup>()
    .run();
  expect(result.status).toBe(404);

  result = await new SimpleStartup(
    new Request().setPath("/restful").setMethod("PUT")
  )
    .useTest({ strict: false })
    .useRouter<SimpleStartup>()
    .run();
  expect(result.status).toBe(200);

  result = await new SimpleStartup(
    new Request().setPath("/restful").setMethod("PUT")
  )
    .useTest({ strict: true })
    .useRouter<SimpleStartup>()
    .run();
  expect(result.status).toBe(200);
});

test("null body test", async function () {
  const result = await new SimpleStartup(
    new Request().setPath("/nullbody").setMethod("PUT")
  )
    .useTest()
    .useRouter<SimpleStartup>()
    .run();

  expect(result.status).toBe(404);
});

test("startup without useTest", async function () {
  try {
    await new SimpleStartup(
      new Request().setPath("/simple/router").setMethod("POST")
    )
      .useRouter<SimpleStartup>()
      .run();
  } catch (err) {
    expect(err.message).toBe("the config file is not exist");
    return;
  }
  expect(true).toBeFalsy();
});
