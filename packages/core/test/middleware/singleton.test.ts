import { Middleware, Startup } from "../../src";
import "../test-startup";

test("middleware pipeline", async () => {
  const startup = new Startup().add(new Md());

  let res = await startup.run();
  expect(res.ctx.get("num")).toBe(1);
  res = await startup.run();
  expect(res.ctx.get("num")).toBe(2);
  res = await startup.run();
  expect(res.ctx.get("num")).toBe(3);
});

class Md extends Middleware {
  #number = 0;

  async invoke(): Promise<void> {
    this.#number++;
    this.ctx.set("num", this.#number);
    await this.next();
  }
}
