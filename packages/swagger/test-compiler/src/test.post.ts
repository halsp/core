import { Header } from "@halsp/pipe";
import { Action } from "@halsp/router";

function Property(target: any, propertyKey: string) {
  //
}

class HeaderDto {
  @Property
  h1?: string;
  h2?: number;
}

export default class extends Action {
  // @Header("h")
  // private readonly body!: any;
  @Header
  private readonly h111!: HeaderDto;

  async invoke(): Promise<void> {
    this.ok();
  }
}
