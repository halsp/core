import { HookType, Startup } from "../../src";
import "../test-startup";

describe("initialization hook", () => {
  it("shoud initializa before invoke", async () => {
    let testArgs: any;
    await new Startup()
      .hook(HookType.Initialization, (args) => {
        testArgs = args;
      })
      .run(1, 2, 3);
    expect(testArgs).toEqual([1, 2, 3]);
  });
});
