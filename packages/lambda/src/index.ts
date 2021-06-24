import { ICloudBaseConfig } from "@cloudbase/node-sdk";
import { HttpContext, Request, Startup } from "sfa";
import ResponseStruct from "./ResponseStruct";
import tcb = require("@cloudbase/node-sdk");
import Dbhelper from "./Dbhelper";
import * as mime from "mime-types";
import { Stream } from "stream";

declare module "sfa" {
  interface Request {
    readonly context: Record<string, unknown>;
    readonly event: Record<string, unknown>;
  }
}

export { ResponseStruct, Dbhelper };

export default class SfaCloudbase extends Startup {
  readonly #ctx: HttpContext;

  constructor(
    event: Record<string, unknown>,
    context: Record<string, unknown>
  ) {
    super();

    const ctx = new HttpContext(
      new Request()
        .setBody(getBody(event))
        .setMethod(event.httpMethod as string)
        .setHeaders(event.headers as Record<string, string | string[]>)
        .setParams(event.queryStringParameters as Record<string, string>)
        .setPath(event.path as string)
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ctx.req as any).context = context;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ctx.req as any).event = event;

    this.#ctx = ctx;
  }

  async run(): Promise<ResponseStruct> {
    await super.invoke(this.#ctx);

    const writeType = !this.#ctx.res.hasHeader("content-type");
    const writeLength = !this.#ctx.res.hasHeader("content-length");

    const res = this.#ctx.res;
    const body = res.body;
    if (typeof body == "string") {
      if (writeLength) {
        res.setHeader("content-length", Buffer.byteLength(body));
      }
      if (writeType) {
        const type = /^\s*</.test(body) ? "html" : "text";
        res.setHeader("content-type", mime.contentType(type) as string);
      }
    } else if (Buffer.isBuffer(body)) {
      if (writeLength) {
        res.setHeader("content-length", body.byteLength);
      }
      if (writeType) {
        res.setHeader("content-type", mime.contentType("bin") as string);
      }
    } else if (
      Object.prototype.toString.call(body).toLowerCase() == "[object object]" &&
      (!Object.getPrototypeOf(body) ||
        Object.getPrototypeOf(body) == Object.prototype)
    ) {
      if (writeLength) {
        res.setHeader(
          "content-length",
          Buffer.byteLength(JSON.stringify(body))
        );
      }
      if (writeType) {
        res.setHeader("content-type", mime.contentType("json") as string);
      }
    } else if (body instanceof Stream) {
      throw new Error("Cloudbase is does support streaming! ");
    }

    return this.struct;
  }

  get struct(): ResponseStruct {
    let body = this.#ctx.res.body;
    const isBase64Encoded = Buffer.isBuffer(body);
    if (isBase64Encoded) {
      body = (body as Buffer).toString("base64");
    }

    return <ResponseStruct>{
      headers: this.#ctx.res.headers,
      statusCode: this.#ctx.res.status,
      isBase64Encoded: isBase64Encoded,
      body: body ?? "",
    };
  }

  useCloudbaseApp<T extends this>(config?: ICloudBaseConfig): T {
    this.use(async (ctx, next) => {
      const tcbConfig: ICloudBaseConfig = config || {
        env: process.env.SCF_NAMESPACE,
      };

      const app = tcb.init(tcbConfig);
      const db = app.database();

      ctx.bag("CB_APP", app);
      ctx.bag("CB_DB", db);

      await next();
    });
    return this as T;
  }

  useCloudbaseDbhelper<T extends this>(): T {
    this.use(async (ctx, next) => {
      const dbhelper = new Dbhelper(ctx);
      ctx.bag("CB_DBHELPER", dbhelper);
      await next();
    });
    return this as T;
  }
}

function getBody(event: Record<string, unknown>): unknown {
  const body = event.body;
  const headers = event.headers as Record<string, string | string[]>;
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
