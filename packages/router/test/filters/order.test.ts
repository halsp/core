import { HttpContext, SfaRequest, TestStartup } from "@sfajs/core";
import { routerCfg } from "../global";
import "../../src";
import { ActionFilter } from "../../src";
import "@sfajs/inject";
import {
  TestActionFilter1,
  TestActionFilter2,
} from "../actions/filters/order.get";

class TestActionFilter4 implements ActionFilter {
  onActionExecuted(_): void | Promise<void> {
    //
  }
  onActionExecuting(
    ctx: HttpContext
  ): boolean | void | Promise<void> | Promise<boolean> {
    ctx.res.body++;
    ctx.res.setHeader(`order4`, ctx.res.body);
  }
}

class TestActionFilter5 implements ActionFilter {
  onActionExecuted(_): void | Promise<void> {
    //
  }
  onActionExecuting(
    ctx: HttpContext
  ): boolean | void | Promise<void> | Promise<boolean> {
    ctx.res.body++;
    ctx.res.setHeader(`order5`, ctx.res.body);
  }
}

class TestActionFilter6 implements ActionFilter {
  onActionExecuted(_): void | Promise<void> {
    //
  }
  onActionExecuting(
    ctx: HttpContext
  ): boolean | void | Promise<void> | Promise<boolean> {
    ctx.res.body++;
    ctx.res.setHeader(`order6`, ctx.res.body);
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
    .useRouter(routerCfg)
    .run();

  console.log("headers", res.headers);
  expect(res.getHeader(`order4`)).toBe("1");
  expect(res.getHeader(`order1`)).toBe("2");
  expect(res.getHeader(`order5`)).toBe("3");
  expect(res.getHeader(`order2`)).toBe("4");

  expect(res.getHeader(`order6`)).toBe("5");
  expect(res.getHeader(`order3`)).toBe("6");
});
