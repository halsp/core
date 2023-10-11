import { Context, Request, Startup } from "@halsp/core";
import { BadRequestException, HttpException } from "@halsp/http";
import "../src";
import { Action } from "@halsp/router";
import { ExceptionFilter, UseFilters } from "../src";
import "@halsp/testing";

test(`empty exception filter`, async () => {
  class TestAction extends Action {
    async invoke(): Promise<void> {
      throw new BadRequestException();
    }
  }

  const res = await new Startup().useHttp().useFilter().add(TestAction).test();

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
      const res = await new Startup()
        .useHttp()
        .setContext(
          new Request().setPath("/filters/exception").setMethod("GET").setBody({
            bad,
            executing,
          }),
        )
        .use(async (ctx, next) => {
          ctx.res.set("h1", 1);
          await next();
          ctx.res.set("h2", 2);
        })
        .useFilter()
        .add(TestAction)
        .test();

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
  const res = await new Startup()
    .useHttp()
    .setContext(new Request().setPath("/filters/exception").setMethod("GET"))
    .useFilter()
    .use(() => {
      throw new BadRequestException();
    })
    .test();

  expect(res.status).toBe(400);
});
