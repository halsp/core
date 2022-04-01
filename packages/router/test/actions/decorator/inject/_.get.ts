import { Action, Inject, InjectDecoratorTypes } from "../../../../src";
import { Service1, Service2 } from "./services";

export default class extends Action {
  @Inject()
  private readonly service1!: Service1;
  @Inject()
  private readonly service11!: Service1;
  @Inject()
  private readonly service2!: Service2;

  @Inject(InjectDecoratorTypes.Singleton)
  private readonly singletonService1!: Service1;
  @Inject(InjectDecoratorTypes.Singleton)
  private readonly singletonService2!: Service1;

  @Inject(InjectDecoratorTypes.Scoped)
  private readonly scopedService!: Service1;

  async invoke(): Promise<void> {
    this.singletonService1.count++;
    this.singletonService2.count += 3;

    this.scopedService.count++;

    this.ok({
      service1: this.service1.invoke(),
      service11: this.service11.invoke(),
      service2: this.service2.invoke(),
      singleton1: this.singletonService1.count,
      singleton2: this.singletonService2.count,
      scopedService: this.scopedService.count,
    });
  }
}
