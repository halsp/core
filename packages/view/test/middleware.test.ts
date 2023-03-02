import { Middleware } from "@halsp/common";
import { TestStartup } from "@halsp/testing";
import "../src";

describe("middleware", () => {
  it("should not render empty string", async () => {
    class Md extends Middleware {
      async invoke(): Promise<void> {
        this.ctx.set("view", await this.ctx.view(""));
      }
    }

    const { ctx } = await new TestStartup()
      .useView()
      .add(() => new Md())
      .run();

    expect(ctx.get("view")).toBeUndefined();
  });

  it("should set views dir", async () => {
    class Md extends Middleware {
      async invoke(): Promise<void> {
        this.ctx.set("view", await this.ctx.view(""));
      }
    }

    const { ctx } = await new TestStartup()
      .useView({
        dir: "test/views",
      })
      .add(() => new Md())
      .run();

    expect(ctx.get("view")).toBeUndefined();
  });
});
