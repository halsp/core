import "../UseTest";
import "../../src";
import { HttpMethod, SimpleStartup, Request } from "sfa";

test(`find next`, async function () {
  const result = await new SimpleStartup(
    new Request().setPath("/restful/method").setMethod(HttpMethod.post)
  )
    .useTest()
    .useRouter<SimpleStartup>()
    .run();
  expect(result.status).toBe(200);
});

test(`find simple`, async function () {
  const result = await new SimpleStartup(
    new Request().setPath("/restful/method/simple").setMethod(HttpMethod.post)
  )
    .useTest()
    .useRouter<SimpleStartup>()
    .run();
  expect(result.status).toBe(200);
  expect((result.body as Record<string, string>).action).toBe("simple");
});

test(`find simple next`, async function () {
  const result = await new SimpleStartup(
    new Request().setPath("/restful/method/any").setMethod(HttpMethod.post)
  )
    .useTest()
    .useRouter<SimpleStartup>()
    .run();
  expect(result.status).toBe(200);
  expect((result.body as Record<string, string>).action).toBe("query");
});

test(`find miss next`, async function () {
  const result = await new SimpleStartup(
    new Request().setPath("/restful/method/miss").setMethod(HttpMethod.post)
  )
    .useTest()
    .useRouter<SimpleStartup>()
    .run();
  expect(result.status).toBe(200);
  expect((result.body as Record<string, string>).action).toBe("miss");
  expect((result.body as Record<string, string>).action).not.toBe("query");
});

test(`find miss next 2`, async function () {
  const result = await new SimpleStartup(
    new Request().setPath("/restful/method/miss/any").setMethod(HttpMethod.post)
  )
    .useTest()
    .useRouter<SimpleStartup>()
    .run();
  expect(result.status).toBe(200);
  expect((result.body as Record<string, string>).action).toBe("miss/query");
});

test(`find miss next 3`, async function () {
  const result = await new SimpleStartup(
    new Request().setPath("/restful/method/any/miss").setMethod(HttpMethod.post)
  )
    .useTest()
    .useRouter<SimpleStartup>()
    .run();
  expect(result.status).toBe(200);
  expect((result.body as Record<string, string>).action).toBe("query/miss");
});

test(`find miss next 4`, async function () {
  const result = await new SimpleStartup(
    new Request().setPath("/restful/method/any/any").setMethod(HttpMethod.post)
  )
    .useTest()
    .useRouter<SimpleStartup>()
    .run();
  expect(result.status).toBe(200);
  expect((result.body as Record<string, string>).action).toBe(
    "query2/nextQuery"
  );
});
