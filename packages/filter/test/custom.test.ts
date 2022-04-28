import { HttpContext, SfaRequest, TestStartup } from "@sfajs/core";
import { Action } from "@sfajs/router";
import {
  Filter,
  CustomFilterExecuted,
  CustomFilterExecuting,
  UseFilters,
  CustomFilter,
  CustomFilterType,
} from "../src";

@CustomFilter(CustomFilterType.BeforeAction)
export class CustomBeforeActionFilter implements Filter {
  @CustomFilterExecuted
  onActionExecuted(ctx: HttpContext): void | Promise<void> {
    ctx.res.body++;
    ctx.res.setHeader(`before-action-2`, ctx.res.body);
  }

  @CustomFilterExecuting
  onExecuting(
    ctx: HttpContext
  ): boolean | void | Promise<void> | Promise<boolean> {
    ctx.res.body++;
    ctx.res.setHeader(`before-action-1`, ctx.res.body);

    if (ctx.req.hasHeader("action") && ctx.req.getHeader("action") == "0") {
      return false;
    }
  }
}

@CustomFilter(CustomFilterType.BeforeAction)
export class CustomBeforeAction1Filter implements Filter {
  @CustomFilterExecuting
  onExecuting(
    ctx: HttpContext
  ): boolean | void | Promise<void> | Promise<boolean> {
    ctx.res.body++;
    ctx.res.setHeader(`1before-action-1`, ctx.res.body);

    if (ctx.req.hasHeader("1action") && ctx.req.getHeader("1action") == "0") {
      return false;
    }
  }
}

@CustomFilter(CustomFilterType.BeforeAction)
export class CustomBeforeAction2Filter implements Filter {
  @CustomFilterExecuted
  onActionExecuted(ctx: HttpContext): void | Promise<void> {
    ctx.res.body++;
    ctx.res.setHeader(`2before-action-2`, ctx.res.body);
  }
}

@CustomFilter(CustomFilterType.BeforeAuthorization)
export class CustomBeforeAuthorizationFilter implements Filter {
  @CustomFilterExecuting
  onExecuting(
    ctx: HttpContext
  ): boolean | void | Promise<void> | Promise<boolean> {
    ctx.res.body++;
    ctx.res.setHeader(`before-authorization-1`, ctx.res.body);

    if (
      ctx.req.hasHeader("authorization") &&
      ctx.req.getHeader("authorization") == "0"
    ) {
      return false;
    }
  }

  @CustomFilterExecuted
  onExecuted(
    ctx: HttpContext
  ): boolean | void | Promise<void> | Promise<boolean> {
    ctx.res.body++;
    ctx.res.setHeader(`before-authorization-2`, ctx.res.body);
  }
}

@CustomFilter(CustomFilterType.BeforeResource)
export class CustomBeforeResourceFilter implements Filter {
  @CustomFilterExecuting
  onExecuting(
    ctx: HttpContext
  ): boolean | void | Promise<void> | Promise<boolean> {
    ctx.res.body++;
    ctx.res.setHeader(`before-resource-1`, ctx.res.body);

    if (ctx.req.hasHeader("resource") && ctx.req.getHeader("resource") == "0") {
      return false;
    }
  }

  @CustomFilterExecuted
  onExecuted(
    ctx: HttpContext
  ): boolean | void | Promise<void> | Promise<boolean> {
    ctx.res.body++;
    ctx.res.setHeader(`before-resource-2`, ctx.res.body);
  }
}

@CustomFilter(CustomFilterType.Last)
export class CustomAfterActionFilter implements Filter {
  @CustomFilterExecuted
  onActionExecuted(ctx: HttpContext): void | Promise<void> {
    ctx.res.body++;
    ctx.res.setHeader(`last-2`, ctx.res.body);
  }

  @CustomFilterExecuting
  onExecuting(
    ctx: HttpContext
  ): boolean | void | Promise<void> | Promise<boolean> {
    ctx.res.body++;
    ctx.res.setHeader(`last-1`, ctx.res.body);

    if (ctx.req.hasHeader("last") && ctx.req.getHeader("last") == "0") {
      return false;
    }
  }
}

@UseFilters(
  CustomBeforeActionFilter,
  CustomBeforeAuthorizationFilter,
  CustomAfterActionFilter,
  CustomBeforeResourceFilter,
  CustomBeforeAction2Filter,
  CustomBeforeAction1Filter
)
class TestAction extends Action {
  invoke(): void | Promise<void> {
    this.ok();
  }
}

const allHeaders = [
  "before-authorization-1",
  "before-resource-1",
  "before-action-1",
  "1before-action-1",
  "last-1",
  "last-2",
  "2before-action-2",
  "before-action-2",
  "before-resource-2",
  "before-authorization-2",
];

function runTest(type: string, executing: boolean, headers: string[]) {
  test(`custom ${type} ${executing}`, async () => {
    const res = await new TestStartup(
      new SfaRequest().setHeader(type, executing ? 1 : 0)
    )
      .use(async (ctx, next) => {
        ctx.res.body = 0;
        await next();
      })
      .useFilter()
      .add(TestAction)
      .run();

    let index = 0;
    function getIndex() {
      index++;
      return index.toString();
    }

    expect(res.status).toBe(executing ? 200 : 404);
    for (const header of headers) {
      expect(res.getHeader(header)).toBe(getIndex());
    }
    for (const header of allHeaders.filter(
      (header) => !headers.includes(header)
    )) {
      expect(res.getHeader(header)).toBeUndefined();
    }
  });
}

function runFaild(type: string, headers: string[]) {
  runTest(type, false, headers);
}

runTest("", true, allHeaders);

runFaild("authorization", ["before-authorization-1"]);
runFaild("resource", ["before-authorization-1", "before-resource-1"]);
runFaild("action", [
  "before-authorization-1",
  "before-resource-1",
  "before-action-1",
]);
runFaild("1action", [
  "before-authorization-1",
  "before-resource-1",
  "before-action-1",
  "1before-action-1",
]);
runFaild("last", [
  "before-authorization-1",
  "before-resource-1",
  "before-action-1",
  "1before-action-1",
  "last-1",
]);
