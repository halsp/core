import { Startup, Request, HookType } from "@halsp/core";
import { Action, MapItem } from "../src";
import "@halsp/testing";
import "@halsp/http";
import "./utils";

describe("extend decorators", () => {
  function CustomDecorator(property: string) {
    return function CustomDecorator(target: any) {
      target.prototype[property] = true;
    };
  }
  async function testDecorators(
    decorators: ClassDecorator[] | ((mapItem: MapItem) => ClassDecorator[]),
    property: string,
    effect: boolean
  ) {
    const result = await new Startup()
      .keepThrow()
      .useHttp()
      .setContext(new Request().setPath("/").setMethod("GET"))
      .hook(HookType.AfterInvoke, (ctx, md) => {
        if (!(md instanceof Action)) {
          return undefined;
        }

        ctx.set("test", md[property]);
      })
      .useTestRouter({
        decorators: decorators,
      })
      .test();

    expect(!!result.ctx.get("test")).toBe(effect);
    expect(result.status).toBe(200);
  }

  it("should not set when decorators is empty", async () => {
    await testDecorators([], "test1", false);
  });

  it("should set common decorators", async () => {
    await testDecorators([CustomDecorator("test2")], "test2", true);
  });

  it("should set common decorators with callback", async () => {
    await testDecorators(() => [CustomDecorator("test3")], "test3", true);
  });

  it("should not set decorators when decorators is empty with callback", async () => {
    await testDecorators(() => [], "test4", false);
  });

  it("should not set decorators when decorators is empty with callback", async () => {
    await testDecorators(() => null as any, "test5", false);
  });
});
