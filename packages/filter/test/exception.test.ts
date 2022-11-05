import { Context, Request } from "@ipare/core";
import { BadRequestException, HttpException } from "@ipare/http";
import "../src";
import { Action } from "@ipare/router";
import { ExceptionFilter, UseFilters } from "../src";
import { TestHttpStartup } from "@ipare/testing/dist/http";

test(`empty exception filter`, async () => {
  class TestAction extends Action {
    async invoke(): Promise<void> {
      throw new BadRequestException();
    }
  }

  const res = await new TestHttpStartup()
    .setSkipThrow()
    .useFilter()
    .add(TestAction)
    .run();

  expect(res.status).toBe(400);
});

class TestExceptionFilter implements ExceptionFilter {
  onException(ctx: Context, error: HttpException): boolean | Promise<boolean> {
    ctx.res.setHeader("ex", error.message);
    return ctx.req.body["executing"];
  }
}

@UseFilters(TestExceptionFilter)
class TestAction extends Action {
  async invoke(): Promise<void> {
    if (this.ctx.req.body["bad"]) {
      throw new BadRequestException("bad");
    } else {
      throw new Error("err");
    }
  }
}

function runTest(executing: boolean) {
  function run(bad: boolean) {
    test(`exception filter ${executing} ${bad}`, async () => {
      const res = await new TestHttpStartup()
        .setSkipThrow()
        .setContext(
          new Request().setPath("/filters/exception").setMethod("GET").setBody({
            bad,
            executing,
          })
        )
        .use(async (ctx, next) => {
          ctx.setHeader("h1", 1);
          await next();
          ctx.setHeader("h2", 2);
        })
        .useFilter()
        .add(TestAction)
        .run();

      expect(res.getHeader(`h1`)).toBe("1");
      expect(res.getHeader(`h2`)).toBe("2");
      if (bad) {
        expect(res.getHeader(`ex`)).toBe("bad");
        if (executing) {
          expect(res.status).toBe(404);
        } else {
          expect(res.status).toBe(400);
        }
      } else {
        expect(res.getHeader(`ex`)).toBe("err");
        if (executing) {
          expect(res.status).toBe(404);
        } else {
          expect(res.status).toBe(500);
        }
      }
    });
  }
  run(true);
  run(false);
}

runTest(true);
runTest(false);

test(`other error`, async () => {
  const res = await new TestHttpStartup()
    .setContext(new Request().setPath("/filters/exception").setMethod("GET"))
    .setSkipThrow()
    .useFilter()
    .use(() => {
      throw new BadRequestException();
    })
    .run();

  expect(res.status).toBe(400);
});
