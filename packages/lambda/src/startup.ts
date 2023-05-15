import "@halsp/http";
import { HeadersDict } from "@halsp/http";
import { HttpMethods } from "@halsp/methods";
import { ResponseStruct } from "./response-struct";
import { Readable } from "stream";
import { Context, Dict, isObject, Startup } from "@halsp/core";

declare module "@halsp/core" {
  interface Startup {
    run(event: Dict, context: Dict): Promise<ResponseStruct>;
    useLambda(): this;
  }
}

Startup.prototype.useLambda = function () {
  return this.extend("run", async (event: Dict, context: Dict) => {
    const ctx = new Context();
    defineCtxProperty(ctx, event, context);
    ctx.req
      .setBody(getBody(event))
      .setMethod(
        event.httpMethod ||
          event.method ||
          event.requestContext?.http?.method ||
          HttpMethods.get
      )
      .setHeaders(event.headers ?? {})
      .setQuery(event.queryStringParameters ?? event.query ?? {})
      .setPath(
        event.path || event.rowPath || event.requestPath || event.url || ""
      );

    await this.useHttp()["invoke"](ctx);
    return await getStruct(ctx);
  }).useHttp();
};

function defineCtxProperty(ctx: Context, event: Dict, context: Dict) {
  Object.defineProperty(ctx.req, "lambdaContext", {
    configurable: false,
    enumerable: false,
    get: () => context,
  });

  Object.defineProperty(ctx.req, "lambdaEvent", {
    configurable: false,
    enumerable: false,
    get: () => event,
  });

  Object.defineProperty(ctx, "lambdaContext", {
    configurable: false,
    enumerable: false,
    get: () => context,
  });

  Object.defineProperty(ctx, "lambdaEvent", {
    configurable: false,
    enumerable: false,
    get: () => event,
  });
}

async function getStruct(ctx: Context): Promise<ResponseStruct> {
  let body = ctx.res.body;
  let isBase64Encoded = false;
  if (Buffer.isBuffer(body)) {
    isBase64Encoded = true;
    body = body.toString("base64");
  } else if (body instanceof Readable) {
    isBase64Encoded = true;
    body = await readSteram(body);
  } else if (isObject(body)) {
    body = JSON.stringify(body);
  }

  return {
    headers: ctx.res.headers,
    statusCode: ctx.res.status,
    status: ctx.res.status,
    isBase64Encoded: isBase64Encoded,
    body: body ?? "",
  };
}

async function readSteram(stream: Readable): Promise<string> {
  const chunks: Buffer[] = [];
  await new Promise<void>((resolve, reject) => {
    stream.on("data", (chunk) => {
      const encoding = stream.readableEncoding ?? undefined;
      if (Buffer.isBuffer(chunk)) {
        chunks.push(chunk);
      } else {
        chunks.push(Buffer.from(chunk, encoding));
      }
    });
    stream.on("end", () => {
      resolve();
    });
    stream.on("error", (err) => {
      reject(err);
    });
  });
  return Buffer.concat(chunks).toString("base64");
}

function getBody(event: Dict): any {
  const body = event.body;
  const headers = event.headers as HeadersDict;
  if (typeof body == "string") {
    if (event.isBase64Encoded) {
      return Buffer.from(body, "base64");
    } else if (
      headers &&
      headers["content-type"]?.includes("application/json")
    ) {
      return JSON.parse(body);
    }
  }

  return body ?? {};
}
