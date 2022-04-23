import { Middleware, SfaRequest, TestStartup } from "@sfajs/core";
import { Body, ReqPipe } from "../../src";

function runPipeTest(
  pipes: ReqPipe[],
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
      new SfaRequest().setBody({
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

export function runSuccessPipeTest(pipes: ReqPipe[], source: any, target: any) {
  runPipeTest(pipes, source, true, target);
}

export function runFieldPipeTest(pipes: ReqPipe[], source: any, target?: any) {
  runPipeTest(pipes, source, false, target);
}
