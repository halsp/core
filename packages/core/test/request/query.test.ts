import { Request } from "../../src";

test("request setQuery", async function () {
  const req = new Request()
    .setQuery("p1", "1")
    .setQuery("p2", "2")
    .setQuery("p3", "3");

  expectQuery(req.query);
});

test("request setQuery", async function () {
  const req = new Request().setQuery({
    p1: "1",
    p2: "2",
    p3: "3",
  });
  expectQuery(req.query);
});

function expectQuery(query: NodeJS.ReadOnlyDict<string>) {
  expect(query.p1).toBe("1");
  expect(query.p2).toBe("2");
  expect(query.p3).toBe("3");
  expect(query.p4).toBe(undefined);
}
