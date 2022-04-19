import { Middleware, SfaRequest, TestStartup } from "@sfajs/core";
import "../../src";
import { CreateInject, InjectType } from "../../src";

function runTest(type: InjectType) {
  const CustomInject = CreateInject((ctx) => {
    if (!ctx.res.body) {
      ctx.res.body = 0;
    }
    ctx.res.body++;
    return ctx.res.body;
  }, type);

  class TestMiddleware extends Middleware {
    @CustomInject
    private readonly count1!: any;
    @CustomInject
    private readonly count2!: any;

    async invoke(): Promise<void> {
      this.ok({
        count1: this.count1,
        count2: this.count2,
      });
    }
  }

  test(`custom inject type ${type}`, async function () {
    const startup = new TestStartup().useInject().add(TestMiddleware);

    let res = await startup.run(new SfaRequest());

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      count1: type == InjectType.Transient ? 1 : 1,
      count2: type == InjectType.Transient ? 2 : 1,
    });

    res = await startup.run(new SfaRequest());
    if (type == InjectType.Transient) {
      expect(res.body).toEqual({
        count1: 1,
        count2: 2,
      });
    } else if (type == InjectType.Scoped) {
      expect(res.body).toEqual({
        count1: 1,
        count2: 1,
      });
    } else if (type == InjectType.Singleton) {
      expect(res.body).toEqual({
        count1: 1,
        count2: 1,
      });
    }
    expect(res.status).toBe(200);
  });
}

runTest(InjectType.Scoped);
runTest(InjectType.Singleton);
runTest(InjectType.Transient);
