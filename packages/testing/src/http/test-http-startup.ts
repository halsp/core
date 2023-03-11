import {
  HttpContext,
  HttpRequest,
  HttpResponse,
  HttpStartup,
} from "@halsp/http";
import { initBaseTestStartup, ITestStartup } from "../test-startup";

export class TestHttpStartup extends HttpStartup {
  constructor() {
    super();
    initBaseTestStartup(this);
  }

  protected async invoke(
    ctx: HttpRequest | HttpContext
  ): Promise<HttpResponse> {
    return await super.invoke(ctx);
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TestHttpStartup
  extends ITestStartup<HttpRequest, HttpResponse, HttpContext> {}
