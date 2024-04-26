import { Action } from "@halsp/router";
import { V } from "../../src";
import { Body, Property } from "@halsp/pipe";

class TestDto {
  @V().Required()
  @Property("b")
  testProperty!: number;
}

@V().Tags("test")
export class TestDeep extends Action {
  @Body private readonly dto!: TestDto;

  @Property private readonly b2!: string;

  async invoke(): Promise<void> {
    this.ok(this.dto);
  }
}
