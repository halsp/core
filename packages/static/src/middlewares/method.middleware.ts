import { DirectoryOptions, FileOptions } from "../options";
import { BaseMiddleware } from "./base.middleware";
import { IS_METHOD_VALID_BAG } from "../constant";
import { HttpMethods } from "@halsp/methods";

export class MethodMiddleware extends BaseMiddleware {
  constructor(readonly options: FileOptions | DirectoryOptions) {
    super();
  }

  protected get allowMethods() {
    const methods: string[] = [];
    if (!this.options.method?.length) {
      methods.push(HttpMethods.get, HttpMethods.head);
    } else if (Array.isArray(this.options.method)) {
      methods.push(...this.options.method);
    } else {
      methods.push(this.options.method);
    }
    return methods.map((m) => m.toUpperCase());
  }

  protected get isMethodValid(): boolean {
    const allowMethods = this.allowMethods;
    return (
      allowMethods.includes(HttpMethods.any) ||
      allowMethods.includes(this.ctx.req.method)
    );
  }

  async invoke(): Promise<void> {
    this.ctx.set(IS_METHOD_VALID_BAG, this.isMethodValid);
    await this.next();
  }
}
