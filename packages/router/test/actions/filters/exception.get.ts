import { BadRequestException, HttpContext, HttpException } from "@sfajs/core";
import { Action, ExceptionFilter, UseFilters } from "../../../src";

class TestExceptionFilter implements ExceptionFilter {
  onException(
    ctx: HttpContext,
    error: HttpException
  ): boolean | Promise<boolean> {
    ctx.res.setHeader("ex", error.message);
    return ctx.req.body["executing"];
  }
}

@UseFilters(TestExceptionFilter)
export default class extends Action {
  async invoke(): Promise<void> {
    if (this.ctx.req.body["bad"]) {
      throw new BadRequestException("bad");
    } else {
      throw new Error("err");
    }
  }
}
