import { Context, Middleware } from "@ipare/core";
import { TestStartup } from "@ipare/testing";
import { createInject, Inject, InjectType } from "../src";
import "reflect-metadata";

describe("custom inject", () => {
  it(`should inject custom property decorators`, async () => {
    function Custom(property: string): PropertyDecorator;
    function Custom(target: any, propertyKey: string | symbol): void;
    function Custom(arg1: any, arg2?: any) {
      if (typeof arg1 == "string") {
        return Inject((ctx) => ctx.bag<object>("custom")[arg1]);
      } else {
        createInject(
          (ctx, parent) => {
            expect(parent instanceof TestMiddleware).toBeTruthy();
            return ctx.bag<object>("custom");
          },
          arg1,
          arg2
        );
      }
    }

    class TestMiddleware extends Middleware {
      @Custom
      private readonly c1!: any;
      @Custom("a")
      private readonly c2!: any;

      async invoke(): Promise<void> {
        this.ctx.bag("result", {
          c1: this.c1,
          c2: this.c2,
        });
      }
    }

    const ctx = await new TestStartup()
      .setContext(
        new Context().bag("custom", {
          a: 1,
        })
      )
      .useInject()
      .add(TestMiddleware)
      .run();

    expect(ctx.bag("result")).toEqual({
      c1: {
        a: 1,
      },
      c2: 1,
    });
  });

  it(`should inject custom parameter decorators`, async () => {
    function Custom(property: string): ParameterDecorator;
    function Custom(
      target: any,
      propertyKey: string | symbol,
      parameterIndex: number
    ): void;
    function Custom(...args: any[]): void | ParameterDecorator {
      if (typeof args[0] == "string") {
        return Inject((ctx) => ctx.bag<object>("custom")[args[0]]);
      } else {
        createInject(
          (ctx, parent) => {
            expect(parent == TestMiddleware).toBeTruthy();
            return ctx.bag<object>("custom");
          },
          args[0],
          args[1],
          args[2]
        );
      }
    }

    @Inject
    class TestMiddleware extends Middleware {
      constructor(
        @Custom private readonly c1: any,
        @Custom("a") readonly c2: any
      ) {
        super();
      }

      async invoke(): Promise<void> {
        this.ctx.bag("result", {
          c1: this.c1,
          c2: this.c2,
        });
      }
    }

    const ctx = await new TestStartup()
      .setContext(
        new Context().bag("custom", {
          a: 1,
        })
      )
      .useInject()
      .add(TestMiddleware)
      .run();

    expect(ctx.bag("result")).toEqual({
      c1: {
        a: 1,
      },
      c2: 1,
    });
  });
});

describe("inject custom type", () => {
  function runPropertyTest(type: InjectType) {
    let count = 0;

    const CustomInject =
      type == InjectType.Singleton
        ? Inject(() => {
            count++;
            return count;
          }, type)
        : Inject((ctx) => {
            if (!ctx.bag("count")) {
              ctx.bag("count", 0);
            }
            ctx.bag("count", ctx.bag<number>("count") + 1);
            return ctx.bag("count");
          }, type);

    class TestMiddleware extends Middleware {
      @CustomInject
      private readonly count1!: any;
      @CustomInject
      private readonly count2!: any;

      async invoke(): Promise<void> {
        this.ctx.bag("result", {
          count1: this.count1,
          count2: this.count2,
        });
      }
    }

    it(`should inject property decorators with custom inject type ${type}`, async function () {
      const startup = new TestStartup().useInject().add(TestMiddleware);

      let ctx = await startup.run();

      expect(ctx.bag("result")).toEqual({
        count1: type == InjectType.Transient ? 1 : 1,
        count2: type == InjectType.Transient ? 2 : 1,
      });

      ctx = await startup.run();
      if (type == InjectType.Transient) {
        expect(ctx.bag("result")).toEqual({
          count1: 1,
          count2: 2,
        });
      } else if (type == InjectType.Scoped) {
        expect(ctx.bag("result")).toEqual({
          count1: 1,
          count2: 1,
        });
      } else if (type == InjectType.Singleton) {
        expect(ctx.bag("result")).toEqual({
          count1: 1,
          count2: 1,
        });
      }
    });
  }
  runPropertyTest(InjectType.Scoped);
  runPropertyTest(InjectType.Singleton);
  runPropertyTest(InjectType.Transient);

  function runParameterTest(type: InjectType) {
    let count = 0;

    const CustomInject =
      type == InjectType.Singleton
        ? Inject(() => {
            count++;
            return count;
          }, type)
        : Inject((ctx) => {
            if (!ctx.bag("count")) {
              ctx.bag("count", 0);
            }
            ctx.bag("count", ctx.bag<number>("count") + 1);
            return ctx.bag("count");
          }, type);

    @Inject
    class TestMiddleware extends Middleware {
      constructor(
        @CustomInject private readonly count1: any,
        @CustomInject private readonly count2: any
      ) {
        super();
      }

      async invoke(): Promise<void> {
        this.ctx.bag("result", {
          count1: this.count1,
          count2: this.count2,
        });
      }
    }

    test(`should inject parameter decorators with custom inject type ${type}`, async function () {
      const startup = new TestStartup().useInject().add(TestMiddleware);

      let ctx = await startup.run();

      expect(ctx.bag("result")).toEqual({
        count1: type == InjectType.Transient ? 1 : 1,
        count2: type == InjectType.Transient ? 2 : 1,
      });

      ctx = await startup.run();
      if (type == InjectType.Transient) {
        expect(ctx.bag("result")).toEqual({
          count1: 1,
          count2: 2,
        });
      } else if (type == InjectType.Scoped) {
        expect(ctx.bag("result")).toEqual({
          count1: 1,
          count2: 1,
        });
      } else if (type == InjectType.Singleton) {
        expect(ctx.bag("result")).toEqual({
          count1: 1,
          count2: 1,
        });
      }
    });
  }

  runParameterTest(InjectType.Scoped);
  runParameterTest(InjectType.Singleton);
  runParameterTest(InjectType.Transient);
});
