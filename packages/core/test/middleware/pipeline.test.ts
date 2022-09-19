import { Middleware } from "../../src";
import { TestStartup } from "../test-startup";

test("middleware pipeline", async () => {
  const startup = new TestStartup()
    .add(() => new Mdw1())
    .add(() => new Mdw2())
    .add(() => new Mdw3())
    .add(() => new Mdw4());

  const result = await startup.run();
  expect(result.bag("result")).toBe("OK");
  expect(result.bag("mdw1")).toBe("mdw1");
  expect(result.bag("mdw2")).toBe("mdw2");
  expect(!!result.bag("mdw2")).toBeTruthy();
  expect(!!result.bag("mdw3")).toBeFalsy();
  expect(!!result.bag("mdw4")).toBeFalsy();
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
    this.ctx.bag("result", "OK");
  }
}

class Mdw4 extends Middleware {
  async invoke(): Promise<void> {
    this.ctx.bag("mdw4", "mdw4");
    await this.next();
  }
}
