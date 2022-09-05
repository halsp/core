import { Middleware } from "../../src";
import { TestStartup } from "../test-startup";

describe("middleware instanceof", () => {
  class Middleware1 extends Middleware {
    async invoke() {
      await this.next();
    }
  }
  class Middleware2 extends Middleware {
    async invoke() {
      this.ok({
        prev: this.isPrevInstanceOf(Middleware1),
        next: this.isNextInstanceOf(Middleware3),
      });
      await this.next();
    }
  }
  class Middleware3 extends Middleware {
    async invoke() {
      await this.next();
    }
  }

  it("should return true when middleware is class", async () => {
    const res = await new TestStartup()
      .add(Middleware1)
      .add(Middleware2)
      .add(Middleware3)
      .run();
    expect(res.body).toEqual({
      prev: true,
      next: true,
    });
  });

  it("should return false when the prev middleware is not exist", async () => {
    const res = await new TestStartup()
      .add(Middleware2)
      .add(Middleware1)
      .add(Middleware3)
      .run();
    expect(res.body).toEqual({
      prev: false,
      next: false,
    });
  });

  it("should return false when the next middleware is not exist", async () => {
    const res = await new TestStartup()
      .add(Middleware1)
      .add(Middleware3)
      .add(Middleware2)
      .run();
    expect(res.body).toEqual({
      prev: false,
      next: false,
    });
  });

  it("should return true when the next middleware extends current", async () => {
    class ParentMiddleware extends Middleware {
      async invoke(): Promise<void> {
        this.ok(this.isNextInstanceOf(ParentMiddleware));
        await this.next();
      }
    }
    class ChildMiddleware extends ParentMiddleware {
      async invoke(): Promise<void> {
        await this.next();
      }
    }

    const res = await new TestStartup()
      .add(ParentMiddleware)
      .add(ChildMiddleware)
      .run();
    expect(res.body).toBeTruthy();
  });

  it("should return true when the next middleware instance extends current", async () => {
    class ParentMiddleware extends Middleware {
      async invoke(): Promise<void> {
        this.ok(this.isNextInstanceOf(ParentMiddleware));
        await this.next();
      }
    }
    class ChildMiddleware extends ParentMiddleware {
      async invoke(): Promise<void> {
        await this.next();
      }
    }

    const res = await new TestStartup()
      .add(ParentMiddleware)
      .add(new ChildMiddleware())
      .run();
    expect(res.body).toBeTruthy();
  });

  it("should return false when the next middleware independence with current", async () => {
    class ParentMiddleware extends Middleware {
      async invoke(): Promise<void> {
        this.ok(this.isNextInstanceOf(ParentMiddleware));
        await this.next();
      }
    }
    class ChildMiddleware extends Middleware {
      async invoke(): Promise<void> {
        await this.next();
      }
    }

    const res = await new TestStartup()
      .add(ParentMiddleware)
      .add(ChildMiddleware)
      .run();
    expect(res.body).toBeFalsy();
  });

  it("should return false when the next middleware instance independence with current", async () => {
    class ParentMiddleware extends Middleware {
      async invoke(): Promise<void> {
        this.ok(this.isNextInstanceOf(ParentMiddleware));
        await this.next();
      }
    }
    class ChildMiddleware extends Middleware {
      async invoke(): Promise<void> {
        await this.next();
      }
    }

    const res = await new TestStartup()
      .add(ParentMiddleware)
      .add(new ChildMiddleware())
      .run();
    expect(res.body).toBeFalsy();
  });
});
