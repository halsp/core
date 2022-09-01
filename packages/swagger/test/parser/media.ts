import { Body } from "@ipare/pipe";
import { Action } from "@ipare/router";
import { S } from "../../src";

@S().Tags("test")
export class DefaultAction extends Action {
  @Body("abc")
  private readonly abc!: number;

  async invoke(): Promise<void> {
    this.ok();
  }
}

@S().Tags("test").MediaTypes()
export class EmptyAction extends Action {
  @Body("abc")
  private readonly abc!: number;

  async invoke(): Promise<void> {
    this.ok();
  }
}

@S().Tags("test").MediaTypes("mt")
export class AddAction extends Action {
  @Body("abc")
  private readonly abc!: number;

  async invoke(): Promise<void> {
    this.ok();
  }
}

@S().Tags("test").MediaTypes("mt1", "mt2").MediaTypes().MediaTypes("mt3")
export class MultipleAction extends Action {
  @Body("abc")
  private readonly abc!: number;

  async invoke(): Promise<void> {
    this.ok();
  }
}
