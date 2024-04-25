import { Middleware, Request, Startup } from "@halsp/core";
import "@halsp/http";
import "@halsp/testing";
import { Body, Header, ParseIntPipe, Property } from "../src";

describe("deep", () => {
  it("should set header deeply", async () => {
    class TestDto {
      @Property("h1")
      public readonly hhh!: string;
      @Property
      public readonly h2!: number;
    }

    class TestMiddleware extends Middleware {
      @Header
      private readonly h!: TestDto;

      async invoke(): Promise<void> {
        this.ok(this.h);
      }
    }

    const res = await new Startup()
      .useHttp()
      .setContext(
        new Request().setHeaders({
          h1: "a",
          h2: 1,
        }),
      )
      .useInject()
      .add(TestMiddleware)
      .test();

    const body = res.body as TestDto;
    expect(body.hhh).toBe("a");
    expect(body.h2).toBe("1");
    expect(res.status).toBe(200);
  });

  it("should set body deeply", async () => {
    class TestDto3 {
      @Property
      public readonly b3!: number;
    }

    class TestDto2 {
      @Property(ParseIntPipe)
      public readonly b2!: number;
      @Property
      public readonly children2!: TestDto3;
    }

    class TestDto {
      @Property("b1")
      public readonly customProperty!: number;
      @Property
      public readonly children1!: TestDto2;
      @Property("children1")
      public readonly customProperty2!: TestDto2;
    }

    class TestMiddleware extends Middleware {
      @Body
      private readonly body!: TestDto;

      async invoke(): Promise<void> {
        this.ok(this.body);
      }
    }

    const res = await new Startup()
      .useHttp()
      .setContext(
        new Request().setBody({
          b1: 1,
          children1: {
            b2: "2",
            children2: {
              b3: 3,
            },
          },
        }),
      )
      .useInject()
      .add(TestMiddleware)
      .test();

    const body = res.body as TestDto;
    expect(body).toEqual({
      customProperty: 1,
      children1: {
        b2: 2,
        children2: {
          b3: 3,
        },
      },
      customProperty2: {
        b2: 2,
        children2: {
          b3: 3,
        },
      },
    });
    expect(res.status).toBe(200);
  });
});
