import { Context, ReadonlyDict } from "@ipare/core";
import "../../src";
import { TestStartup } from "../test-startup";

beforeAll(() => {
  new TestStartup();
});

test("request setQuery", async () => {
  const req = new Context().req
    .setQuery("p1", "1")
    .setQuery("p2", "2")
    .setQuery("p3", "3")
    .setQuery("p4", null as any);

  expectQuery(req.query);
});

test("request setQuery", async () => {
  const req = new Context().req.setQuery({
    p1: "1",
    p2: "2",
    p3: "3",
    p4: undefined as any,
  });
  expectQuery(req.query);
});

function expectQuery(query: ReadonlyDict<string>) {
  expect(query.p1).toBe("1");
  expect(query.p2).toBe("2");
  expect(query.p3).toBe("3");
  expect(query.p4).toBe("");
  expect(query.p5).toBeUndefined();
}
