import { Middleware } from "../../src";
import { TestStartup } from "../test-startup";

test("middleware pipeline", async () => {
  const startup = new TestStartup().add(new Md());

  let res = await startup.run();
  expect(res.ctx.bag("num")).toBe(1);
  res = await startup.run();
  expect(res.ctx.bag("num")).toBe(2);
  res = await startup.run();
  expect(res.ctx.bag("num")).toBe(3);
});

class Md extends Middleware {
  #number = 0;

  async invoke(): Promise<void> {
    this.#number++;
    this.ctx.bag("num", this.#number);
    await this.next();
  }
}
