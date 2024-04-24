import { Action } from "@halsp/router";
import { V } from "../../src";
import { Body, Query } from "@halsp/pipe";

class TestDto {
  @V().Ignore().Required()
  @Query
  b3!: number;
}

@V().Tags("test")
export class TestDeep extends Action {
  @Body private readonly dto!: TestDto;

  async invoke(): Promise<void> {
    this.ok(this.dto);
  }
}
