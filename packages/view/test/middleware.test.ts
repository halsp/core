import { Middleware, Startup } from "@halsp/core";
import "@halsp/testing";
import "../src";

describe("middleware", () => {
  it("should not render empty string", async () => {
    class Md extends Middleware {
      async invoke(): Promise<void> {
        this.ctx.set("view", await this.ctx.view(""));
      }
    }

    const { ctx } = await new Startup()
      .useView()
      .add(() => new Md())
      .test();

    expect(ctx.get("view")).toBeUndefined();
  });

  it("should set views dir", async () => {
    class Md extends Middleware {
      async invoke(): Promise<void> {
        this.ctx.set("view", await this.ctx.view(""));
      }
    }

    const { ctx } = await new Startup()
      .useView({
        dir: "test/views",
      })
      .add(() => new Md())
      .test();

    expect(ctx.get("view")).toBeUndefined();
  });
});
