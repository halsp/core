import { Middleware } from "../../src";
import { TestStartup } from "../test-startup";

test("middleware pipeline", async () => {
  const startup = new TestStartup().add(new Md());

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
