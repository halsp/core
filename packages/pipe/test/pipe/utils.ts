import { Middleware, SfaRequest, TestStartup } from "@sfajs/core";
import { Body, ReqPipe } from "../../src";

export function runPipeTest(pipes: ReqPipe[], source: any, target?: any) {
  class TestMiddleware extends Middleware {
    @Body("b1", ...pipes)
    readonly b1!: any;

    invoke(): void {
      this.ok({
        b1: this.b1,
      });
    }
  }

  test(`parse: ${source}, ${target}`, async () => {
    const res = await new TestStartup(
      new SfaRequest().setBody({
        b1: source,
      })
    )
      .useInject()
      .add(new TestMiddleware())
      .run();
    expect(res.status).toBe(target == undefined ? 400 : 200);
    if (target != undefined) {
      expect(res.body).toEqual({
        b1: target,
      });
    }
  });
}
