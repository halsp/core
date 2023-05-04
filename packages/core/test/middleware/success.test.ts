import { Middleware, Dict, Startup } from "../../src";
import "../test-startup";

test("middleware success", async () => {
  const stepResult: Dict<number> = {
    step: 0,
  };

  const { ctx } = await new Startup()
    .add(() => new Mdw1(stepResult))
    .add(() => new Mdw2(stepResult))
    .add(() => new Mdw3(stepResult))
    .add(() => new Mdw4(stepResult))
    .run();

  expect(stepResult.step).toBe(111);
  expect(ctx.get("result")).toBe("middleware-success");
});

class Mdw1 extends Middleware {
  constructor(private stepResult: Dict<number>) {
    super();
  }

  async invoke(): Promise<void> {
    this.stepResult.step += 1;
    await this.next();
  }
}

class Mdw2 extends Middleware {
  constructor(private stepResult: Dict<number>) {
    super();
  }

  async invoke(): Promise<void> {
    this.stepResult.step += 10;
    await this.next();
  }
}

class Mdw3 extends Middleware {
  constructor(private stepResult: Dict<number>) {
    super();
  }

  async invoke(): Promise<void> {
    this.stepResult.step += 100;
    this.ctx.set("result", "middleware-success");
  }
}

class Mdw4 extends Middleware {
  constructor(private stepResult: Dict<number>) {
    super();
  }

  async invoke(): Promise<void> {
    this.stepResult.step += 1000;
    await this.next();
  }
}
