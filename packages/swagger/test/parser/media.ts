import { Body } from "@ipare/pipe";
import { Action } from "@ipare/router";
import { S } from "../../src";

@S().Tags("test").RemoveDefaultMediaTypes()
export class Remove extends Action {
  @Body("abc")
  private readonly abc!: number;

  async invoke(): Promise<void> {
    this.ok();
  }
}

@S().Tags("test").MediaTypes("mt")
export class Add extends Action {
  @Body("abc")
  private readonly abc!: number;

  async invoke(): Promise<void> {
    this.ok();
  }
}
