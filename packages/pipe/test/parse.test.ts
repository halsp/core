import { ReadonlyDict, TestStartup } from "@sfajs/core";
import "../src";
import { Header, Query, Param, Body, parseReqDeco } from "../src";
import { expectBody, getTestRequest } from "./TestMiddleware";

class TestService {
  @Header
  private readonly header!: ReadonlyDict;
  @Query
  private readonly query1!: ReadonlyDict;
  @Query
  private readonly query2!: ReadonlyDict;
  @Param
  private readonly params!: ReadonlyDict;
  @Body
  private readonly body!: ReadonlyDict;
  @Body("array")
  private readonly arrayFieldBody!: string;
  @Query("q")
  private readonly queryProperty!: string;

  invoke() {
    return {
      header: this.header,
      query1: this.query1,
      query2: this.query2,
      params: this.params,
      body: this.body,
      arrayFieldBody: this.arrayFieldBody,
      queryProperty: this.queryProperty,
    };
  }
}

test(`object`, async function () {
  const res = await new TestStartup(getTestRequest())
    .use(async (ctx) => {
      const obj = parseReqDeco(ctx, new TestService());
      return ctx.ok(obj.invoke());
    })
    .run();
  expect(res.status).toBe(200);
  expect(res.body).toEqual(expectBody);
});

test(`constructor`, async function () {
  const res = await new TestStartup(getTestRequest())
    .use(async (ctx) => {
      const obj = parseReqDeco(ctx, TestService);
      return ctx.ok(obj.invoke());
    })
    .run();
  expect(res.status).toBe(200);
  expect(res.body).toEqual(expectBody);
});

test(`without decorator`, async function () {
  class TestService2 {}

  const res = await new TestStartup(getTestRequest())
    .use(async (ctx) => {
      parseReqDeco(ctx, TestService2);
      return ctx.ok();
    })
    .run();
  expect(res.status).toBe(200);
});
