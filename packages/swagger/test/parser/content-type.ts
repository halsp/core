import { Body } from "@halsp/pipe";
import { Action } from "@halsp/router";
import { V } from "@halsp/validator";

@V.Tags("test")
export class DefaultAction extends Action {
  @Body("abc")
  private readonly abc!: number;

  async invoke(): Promise<void> {
    this.ok();
  }
}

@V.Tags("test").ContentTypes()
export class EmptyAction extends Action {
  @Body("abc")
  private readonly abc!: number;

  async invoke(): Promise<void> {
    this.ok();
  }
}

@V.Tags("test").ContentTypes("mt")
export class AddAction extends Action {
  @Body("abc")
  private readonly abc!: number;

  async invoke(): Promise<void> {
    this.ok();
  }
}

@V.Tags("test").ContentTypes("mt1", "mt2").ContentTypes().ContentTypes("mt3")
export class MultipleAction extends Action {
  @Body("abc")
  private readonly abc!: number;

  async invoke(): Promise<void> {
    this.ok();
  }
}
