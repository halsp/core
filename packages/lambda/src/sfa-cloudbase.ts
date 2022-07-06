import {
  HttpContext,
  SfaRequest,
  Startup,
  Dict,
  HeadersDict,
} from "@sfajs/core";
import { ResponseStruct } from "./response-struct";

export class SfaCloudbase extends Startup {
  async run(event: Dict, context: Dict): Promise<ResponseStruct> {
    const ctx = this.createContext(event, context);
    await super.invoke(ctx);
    return this.getStruct(ctx);
  }

  private createContext(event: Dict, context: Dict): HttpContext {
    const ctx = new HttpContext(
      new SfaRequest()
        .setBody(this.getBody(event))
        .setMethod(event.httpMethod as string)
        .setHeaders((event.headers ?? {}) as HeadersDict)
        .setQuery((event.queryStringParameters ?? {}) as Dict<string>)
        .setPath(event.path as string)
    );

    Object.defineProperty(ctx.req, "context", {
      configurable: false,
      enumerable: false,
      get: () => context,
    });

    Object.defineProperty(ctx.req, "event", {
      configurable: false,
      enumerable: false,
      get: () => event,
    });

    return ctx;
  }

  private getStruct(ctx: HttpContext): ResponseStruct {
    let body = ctx.res.body;
    const isBase64Encoded = Buffer.isBuffer(body);
    if (isBase64Encoded) {
      body = (body as Buffer).toString("base64");
    }

    return <ResponseStruct>{
      headers: ctx.res.headers,
      statusCode: ctx.res.status,
      isBase64Encoded: isBase64Encoded,
      body: body ?? "",
    };
  }

  private getBody(event: Dict): any {
    const body = event.body;
    const headers = event.headers as HeadersDict;
    if (body && typeof body == "string") {
      if (event.isBase64Encoded) {
        return Buffer.from(body, "base64");
      } else if (
        headers &&
        headers["content-type"]?.includes("application/json")
      ) {
        return JSON.parse(body);
      }
    }

    return body || {};
  }
}
