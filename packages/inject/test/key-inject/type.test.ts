import { isUndefined, Middleware } from "@ipare/core";
import "../../src";
import { Service1 } from "../services";
import { Inject, InjectType } from "../../src";
import { TestStartup } from "@ipare/testing";

class TestMiddleware extends Middleware {
  @Inject("KEY1")
  private readonly service1!: any;
  @Inject("KEY1")
  private readonly service2!: any;

  async invoke(): Promise<void> {
    this.service1.count++;
    this.service2.count += 3;

    this.ctx.bag("result", {
      count1: this.service1.count,
      count2: this.service2.count,
    });
  }
}

function runTest(type?: InjectType) {
  test(`key inject type ${type}`, async function () {
    const startup = new TestStartup()
      .useInject()
      .inject("KEY1", Service1, type)
      .add(TestMiddleware);

    let ctx = await startup.run();

    expect(ctx.bag("result")).toEqual({
      count1: type == InjectType.Transient ? 1 : 4,
      count2: type == InjectType.Transient ? 3 : 4,
    });

    ctx = await startup.run();
    if (type == InjectType.Transient) {
      expect(ctx.bag("result")).toEqual({
        count1: 1,
        count2: 3,
      });
    } else if (type == InjectType.Scoped || isUndefined(type)) {
      expect(ctx.bag("result")).toEqual({
        count1: 4,
        count2: 4,
      });
    } else if (type == InjectType.Singleton) {
      expect(ctx.bag("result")).toEqual({
        count1: 8,
        count2: 8,
      });
    }
  });
}

runTest();
runTest(InjectType.Scoped);
runTest(InjectType.Singleton);
runTest(InjectType.Transient);
