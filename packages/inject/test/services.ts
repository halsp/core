import { Inject } from "../src";

export class Service1 {
  public invoke(): string {
    this.count++;
    return "service1";
  }

  public count = 0;
}

export class Service2 {
  @Inject
  private readonly service1!: Service1;

  public invoke(): string {
    return "service2." + this.service1.invoke();
  }
}
