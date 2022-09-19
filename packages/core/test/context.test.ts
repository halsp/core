import { TestStartup } from "./test-startup";

async function getContext() {
  return await new TestStartup().run();
}

describe("context.bag", () => {
  it("bag", async () => {
    const context = await getContext();
    context.bag("BAG1", "BAG1");
    context.bag("BAG2", { bag2: "BAG2" });

    expect(context.bag("BAG1")).toBe("BAG1");
    expect(context.bag<any>("BAG2").bag2).toBe("BAG2");
    expect(context.bag<any>("BAG2")).toBe(context.bag<any>("BAG2"));
  });

  it("transient bag", async () => {
    const context = await getContext();
    context.bag("BAG3", "transient", () => "BAG3");
    context.bag("BAG4", "transient", () => ({ bag4: "BAG4" }));

    expect(context.bag("BAG3")).toBe("BAG3");
    expect(context.bag<any>("BAG4").bag4).toBe("BAG4");
    expect(context.bag<any>("BAG4")).toEqual(context.bag<any>("BAG4"));
    expect(context.bag<any>("BAG4")).not.toBe(context.bag<any>("BAG4"));
  });

  it("scoped bag", async () => {
    const context = await getContext();
    context.bag("BAG3", "scoped", () => "BAG3");
    context.bag("BAG4", "scoped", () => ({ bag4: "BAG4" }));

    expect(context.bag("BAG3")).toBe("BAG3");
    expect(context.bag<any>("BAG4").bag4).toBe("BAG4");
    expect(context.bag<any>("BAG4")).toBe(context.bag<any>("BAG4"));
  });

  it("singleton bag", async () => {
    {
      const context = await getContext();
      context.bag("BAG3", "singleton", () => "BAG3");
      context.bag("BAG4", "singleton", () => ({ bag4: "BAG4" }));

      expect(context.bag("BAG3")).toBe("BAG3");
      expect(context.bag<any>("BAG4").bag4).toBe("BAG4");
      expect(context.bag<any>("BAG4")).toBe(context.bag<any>("BAG4"));
    }

    {
      const context = await getContext();
      context.bag("BAG3", "singleton", () => "BAG3");
      context.bag("BAG4", "singleton", () => ({ bag4: "BAG4" }));

      expect(context.bag("BAG3")).toBe("BAG3");
      expect(context.bag<any>("BAG4").bag4).toBe("BAG4");
      expect(context.bag<any>("BAG4")).toBe(context.bag<any>("BAG4"));
    }
  });
});
