import { ComposeMiddleware, Middleware, Startup } from "../../src";
import "../test-startup";

describe("middleware instanceof", () => {
  class Middleware1 extends Middleware {
    async invoke() {
      await this.next();
    }
  }
  class Middleware2 extends Middleware {
    async invoke() {
      this.ctx.set("result", {
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
    const { ctx } = await new Startup()
      .add(Middleware1)
      .add(Middleware2)
      .add(Middleware3)
      .run();
    expect(ctx.get("result")).toEqual({
      prev: true,
      next: true,
    });
  });

  it("should return false when the prev middleware is not exist", async () => {
    const { ctx } = await new Startup()
      .add(Middleware2)
      .add(Middleware1)
      .add(Middleware3)
      .run();
    expect(ctx.get("result")).toEqual({
      prev: false,
      next: false,
    });
  });

  it("should return false when the next middleware is not exist", async () => {
    const { ctx } = await new Startup()
      .add(Middleware1)
      .add(Middleware3)
      .add(Middleware2)
      .run();
    expect(ctx.get("result")).toEqual({
      prev: false,
      next: false,
    });
  });

  it("should return true when the next middleware extends current", async () => {
    class ParentMiddleware extends Middleware {
      async invoke(): Promise<void> {
        this.ctx.set("result", this.isNextInstanceOf(ParentMiddleware));
        await this.next();
      }
    }
    class ChildMiddleware extends ParentMiddleware {
      async invoke(): Promise<void> {
        await this.next();
      }
    }

    const { ctx } = await new Startup()
      .add(ParentMiddleware)
      .add(ChildMiddleware)
      .run();
    expect(ctx.get("result")).toBeTruthy();
  });

  it("should return true when the next middleware instance extends current", async () => {
    class ParentMiddleware extends Middleware {
      async invoke(): Promise<void> {
        this.ctx.set("result", this.isNextInstanceOf(ParentMiddleware));
        await this.next();
      }
    }
    class ChildMiddleware extends ParentMiddleware {
      async invoke(): Promise<void> {
        await this.next();
      }
    }

    const { ctx } = await new Startup()
      .add(ParentMiddleware)
      .add(new ChildMiddleware())
      .run();
    expect(ctx.get("result")).toBeTruthy();
  });

  it("should return false when the next middleware independence with current", async () => {
    class ParentMiddleware extends Middleware {
      async invoke(): Promise<void> {
        this.ctx.set("result", this.isNextInstanceOf(ParentMiddleware));
        await this.next();
      }
    }
    class ChildMiddleware extends Middleware {
      async invoke(): Promise<void> {
        await this.next();
      }
    }

    const { ctx } = await new Startup()
      .add(ParentMiddleware)
      .add(ChildMiddleware)
      .run();
    expect(ctx.get("result")).toBeFalsy();
  });

  it("should return false when the next middleware instance independence with current", async () => {
    class ParentMiddleware extends Middleware {
      async invoke(): Promise<void> {
        this.ctx.set("result", this.isNextInstanceOf(ParentMiddleware));
        await this.next();
      }
    }
    class ChildMiddleware extends Middleware {
      async invoke(): Promise<void> {
        await this.next();
      }
    }

    const { ctx } = await new Startup()
      .add(ParentMiddleware)
      .add(new ChildMiddleware())
      .run();
    expect(ctx.get("result")).toBeFalsy();
  });

  it("should return true when add middleware with type", async () => {
    class ParentMiddleware extends Middleware {
      async invoke(): Promise<void> {
        this.ctx.set("result", this.isNextInstanceOf(ParentMiddleware));
        await this.next();
      }
    }
    class ChildMiddleware extends Middleware {
      async invoke(): Promise<void> {
        await this.next();
      }
    }

    const { ctx } = await new Startup()
      .add(ParentMiddleware)
      .add(() => new ParentMiddleware(), ChildMiddleware)
      .run();
    expect(ctx.get("result")).toBeFalsy();
  });

  it("should return true when add middleware in ComposeMiddleware with type", async () => {
    const { ctx } = await new Startup()
      .add(() =>
        new ComposeMiddleware()
          .add(Middleware1)
          .add(() => new Middleware1(), Middleware1)
      )
      .run();
    expect(ctx.get("result")).toBeFalsy();
  });
});
