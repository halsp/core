import { Middleware } from "../../src";
import { TestStartup } from "../test-startup";

test("middleware pipeline", async () => {
  const startup = new TestStartup()
    .add(() => new Mdw1())
    .add(() => new Mdw2())
    .add(() => new Mdw3())
    .add(() => new Mdw4());

  const { ctx } = await startup.run();
  expect(ctx.bag("ctx")).toBe("OK");
  expect(ctx.bag("mdw1")).toBe("mdw1");
  expect(ctx.bag("mdw2")).toBe("mdw2");
  expect(!!ctx.bag("mdw2")).toBeTruthy();
  expect(!!ctx.bag("mdw3")).toBeFalsy();
  expect(!!ctx.bag("mdw4")).toBeFalsy();
});

class Mdw1 extends Middleware {
  async invoke(): Promise<void> {
    this.ctx.bag("mdw1", "mdw1");
    await this.next();
  }
}

class Mdw2 extends Middleware {
  async invoke(): Promise<void> {
    this.ctx.bag("mdw2", "mdw2");
    await this.next();
  }
}

class Mdw3 extends Middleware {
  async invoke(): Promise<void> {
    this.ctx.bag("ctx", "OK");
  }
}

class Mdw4 extends Middleware {
  async invoke(): Promise<void> {
    this.ctx.bag("mdw4", "mdw4");
    await this.next();
  }
}
