import { Middleware } from "../../src/index";
import { SimpleStartup } from "../../src";

test("middleware pipeline", async function () {
  const startup = new SimpleStartup()
    .use(() => new Mdw1())
    .use(() => new Mdw2())
    .use(() => new Mdw3())
    .use(() => new Mdw4());

  // startup.ctx.mds[2].md = startup.ctx.mds[2].builder();

  const result = await startup.run();
  expect(result.status).toBe(200);
  expect(result.body).toBe("OK");
  expect(result.getHeader("mdw1")).toBe("mdw1");
  expect(result.getHeader("mdw2")).toBe("mdw2");
  expect(!!result.getHeader("mdw2")).toBeTruthy();
  expect(!!result.getHeader("mdw3")).toBeFalsy();
  expect(!!result.getHeader("mdw4")).toBeFalsy();
});

class Mdw1 extends Middleware {
  async invoke(): Promise<void> {
    this.ctx.res.setHeader("mdw1", "mdw1");
    await this.next();
  }
}

class Mdw2 extends Middleware {
  async invoke(): Promise<void> {
    this.ctx.res.setHeader("mdw2", "mdw2");
    await this.next();
  }
}

class Mdw3 extends Middleware {
  async invoke(): Promise<void> {
    this.ok("OK");
  }
}

class Mdw4 extends Middleware {
  async invoke(): Promise<void> {
    this.ctx.res.setHeader("mdw4", "mdw4");
    await this.next();
  }
}
