import { Middleware } from "@ipare/core";
import { TestStartup } from "@ipare/testing";
import "../src";

test("default", async () => {
  class Md extends Middleware {
    async invoke(): Promise<void> {
      this.ctx.bag("view", await this.ctx.view(""));
    }
  }

  const { ctx } = await new TestStartup()
    .useView()
    .add(() => new Md())
    .run();

  expect(ctx.bag("view")).toBeUndefined();
});

test("middleware class", async () => {
  class Md extends Middleware {
    async invoke(): Promise<void> {
      this.ctx.bag(
        "view",
        await this.ctx.view("ejs", {
          name: "test ejs",
        })
      );
    }
  }

  const { ctx } = await new TestStartup()
    .useView({
      dir: "test/views",
    })
    .add(() => new Md())
    .run();

  expect(ctx.bag("view")).toBe("<p>test ejs</p>");
});

test("middleware class default", async () => {
  class Md extends Middleware {
    async invoke(): Promise<void> {
      this.ctx.bag("view", await this.ctx.view(""));
    }
  }

  const { ctx } = await new TestStartup()
    .useView({
      dir: "test/views",
    })
    .add(() => new Md())
    .run();

  expect(ctx.bag("view")).toBeUndefined();
});
