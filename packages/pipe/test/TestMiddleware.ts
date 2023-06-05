import { Middleware, ReadonlyDict, Request } from "@halsp/core";
import { Header, Query, Param, Body } from "../src";

export class TestMiddleware extends Middleware {
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

  async invoke(): Promise<void> {
    this.ok({
      header: this.header,
      query1: this.query1,
      query2: this.query2,
      params: this.params,
      body: this.body,
      arrayFieldBody: this.arrayFieldBody,
      queryProperty: this.queryProperty,
    });
  }
}

export const expectBody = {
  header: { h1: "1" },
  query1: { q: "q" },
  query2: { q: "q" },
  queryProperty: "q",
  queryProperty1: undefined,
  params: {},
  body: [0, 1],
  arrayFieldBody: undefined,
};

export function getTestRequest() {
  const req = new Request()
    .setMethod("GET")
    .setBody([0, 1])
    .setHeader("h1", 1)
    .setQuery("q", "q");
  Object.defineProperty(req, "params", {
    enumerable: true,
    configurable: true,
    value: {},
  });
  return req;
}
