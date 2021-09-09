import { ReadonlyDict } from "@sfajs/header";
import { SfaRequest } from "../../src";

test("request setQuery", async function () {
  const req = new SfaRequest()
    .setQuery("p1", "1")
    .setQuery("p2", "2")
    .setQuery("p3", "3")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .setQuery("p4", null as any);

  expectQuery(req.query);
});

test("request setQuery", async function () {
  const req = new SfaRequest().setQuery({
    p1: "1",
    p2: "2",
    p3: "3",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
