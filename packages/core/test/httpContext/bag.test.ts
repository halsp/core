import { HttpContext, SfaRequest } from "../../src";

test("bag", async function () {
  const context = new HttpContext(new SfaRequest());
  context.bag("BAG1", "BAG1");
  context.bag("BAG2", { bag2: "BAG2" });
  context.bag("BAG3", () => "BAG3");
  context.bag("BAG4", () => ({ bag4: "BAG4" }));

  expect(context.bag("BAG1")).toBe("BAG1");
  expect(context.bag<any>("BAG2").bag2).toBe("BAG2");
  expect(context.bag("BAG3")).toBe("BAG3");
  expect(context.bag<any>("BAG4").bag4).toBe("BAG4");

  expect(context.bag<any>("BAG2")).toBe(context.bag<any>("BAG2"));

  expect(context.bag<any>("BAG4")).toEqual(context.bag<any>("BAG4"));
  expect(context.bag<any>("BAG4")).not.toBe(context.bag<any>("BAG4"));
});
