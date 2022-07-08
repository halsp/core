import { Middleware, Request, TestStartup } from "@sfajs/core";
import { Body, PipeItem } from "../../src";

function runPipeTest(
  pipes: PipeItem[],
  source: any,
  success: boolean,
  target?: any
) {
  class TestMiddleware extends Middleware {
    @Body("b1", ...pipes)
    readonly b1!: any;

    invoke(): void {
      this.ok({
        b1: this.b1,
      });
    }
  }

  test(`parse: ${success} ${source}, ${target}`, async () => {
    const res = await new TestStartup(
      new Request().setBody({
        b1: source,
      })
    )
      .useInject()
      .add(new TestMiddleware())
      .run();
    expect(res.status).toBe(success ? 200 : 400);
    if (success) {
      expect(res.body).toEqual({
        b1: target,
      });
    }
  });
}

export function runSuccessPipeTest(
  pipes: PipeItem[],
  source: any,
  target: any
) {
  runPipeTest(pipes, source, true, target);
}

export function runFieldPipeTest(pipes: PipeItem[], source: any, target?: any) {
  runPipeTest(pipes, source, false, target);
}
