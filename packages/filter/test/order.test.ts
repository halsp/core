import { HttpContext, SfaRequest, TestStartup } from "@sfajs/core";
import "../src";
import { ActionFilter, UseFilters } from "../src";
import "@sfajs/inject";
import { Action } from "@sfajs/router";

export class TestActionFilter1 implements ActionFilter {
  onActionExecuted(ctx: HttpContext): void | Promise<void> {
    ctx.res.body++;
    ctx.res.setHeader(`order12`, ctx.res.body);
  }
  onActionExecuting(
    ctx: HttpContext
  ): boolean | void | Promise<void> | Promise<boolean> {
    ctx.res.body++;
    ctx.res.setHeader(`order11`, ctx.res.body);
  }
}

export class TestActionFilter2 implements ActionFilter {
  onActionExecuted(ctx: HttpContext): void | Promise<void> {
    ctx.res.body++;
    ctx.res.setHeader(`order22`, ctx.res.body);
  }
  onActionExecuting(
    ctx: HttpContext
  ): boolean | void | Promise<void> | Promise<boolean> {
    ctx.res.body++;
    ctx.res.setHeader(`order21`, ctx.res.body);
  }
}

export class TestActionFilter3 implements ActionFilter {
  onActionExecuted(ctx: HttpContext): void | Promise<void> {
    ctx.res.body++;
    ctx.res.setHeader(`order32`, ctx.res.body);
  }
  onActionExecuting(
    ctx: HttpContext
  ): boolean | void | Promise<void> | Promise<boolean> {
    ctx.res.body++;
    ctx.res.setHeader(`order31`, ctx.res.body);
  }
}

class TestActionFilter4 implements ActionFilter {
  onActionExecuted(ctx: HttpContext): void | Promise<void> {
    ctx.res.body++;
    ctx.res.setHeader(`order42`, ctx.res.body);
  }
  onActionExecuting(
    ctx: HttpContext
  ): boolean | void | Promise<void> | Promise<boolean> {
    ctx.res.body++;
    ctx.res.setHeader(`order41`, ctx.res.body);
  }
}

class TestActionFilter5 implements ActionFilter {
  onActionExecuted(ctx: HttpContext): void | Promise<void> {
    ctx.res.body++;
    ctx.res.setHeader(`order52`, ctx.res.body);
  }
  onActionExecuting(
    ctx: HttpContext
  ): boolean | void | Promise<void> | Promise<boolean> {
    ctx.res.body++;
    ctx.res.setHeader(`order51`, ctx.res.body);
  }
}

class TestActionFilter6 implements ActionFilter {
  onActionExecuted(ctx: HttpContext): void | Promise<void> {
    ctx.res.body++;
    ctx.res.setHeader(`order62`, ctx.res.body);
  }
  onActionExecuting(
    ctx: HttpContext
  ): boolean | void | Promise<void> | Promise<boolean> {
    ctx.res.body++;
    ctx.res.setHeader(`order61`, ctx.res.body);
  }
}

@UseFilters(TestActionFilter1, new TestActionFilter2(), TestActionFilter3)
class TestAction extends Action {
  async invoke(): Promise<void> {
    this.ok();
  }
}

test(`filter order`, async () => {
  const res = await new TestStartup(
    new SfaRequest().setPath("filters/order").setMethod("GET")
  )
    .use(async (ctx, next) => {
      ctx.res.body = 0;
      await next();
    })
    .useGlobalFilter(new TestActionFilter5(), 3)
    .useGlobalFilter(TestActionFilter6)
    .useGlobalFilter(TestActionFilter4, 1)
    .useFilterOrder(TestActionFilter1, 2)
    .useFilterOrder(TestActionFilter2, 4)
    .add(TestAction)
    .run();

  const orders = [4, 1, 5, 2, 6, 3];
  (() => {
    for (let i = 0; i < orders.length; i++) {
      const index = orders[i];
      expect(res.getHeader(`order${index}1`)).toBe((i + 1).toString());
    }

    for (let i = orders.length; i < orders.length * 2; i++) {
      const index = orders[orders.length * 2 - i - 1];
      expect(res.getHeader(`order${index}2`)).toBe((i + 1).toString());
    }
  })();
});
