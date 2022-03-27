import { TestStartup, Middleware, Dict } from "../../src";

test("middleware success", async function () {
  const stepResult: Dict<number> = {
    step: 0,
  };

  const res = await new TestStartup()
    .add(() => new Mdw1(stepResult))
    .add(() => new Mdw2(stepResult))
    .add(() => new Mdw3(stepResult))
    .add(() => new Mdw4(stepResult))
    .run();

  expect(res.status).toBe(200);
  expect(stepResult.step).toBe(111);
  expect(res.body).toBe("middleware-success");
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
    this.ok("middleware-success");
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
