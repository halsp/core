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
  async run(
    event: Record<string, unknown>,
    context: Record<string, unknown>
  ): Promise<ResponseStruct> {
    const ctx = this.createContext(event, context);
    await super.invoke(ctx);
    this.setType(ctx);
    return this.getStruct(ctx);
  }

  private createContext(
    event: NodeJS.Dict<unknown>,
    context: NodeJS.Dict<unknown>
  ): HttpContext {
    const ctx = new HttpContext(
      new Request()
        .setBody(this.getBody(event))
        .setMethod(event.httpMethod as string)
        .setHeaders(event.headers as Record<string, string>)
        .setQuery(event.queryStringParameters as NodeJS.Dict<string>)
        .setPath(event.path as string)
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ctx.req as any).context = context;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ctx.req as any).event = event;
    return ctx;
  }

  private setType(ctx: HttpContext) {
    const writeType = !ctx.res.hasHeader("content-type");
    const writeLength = !ctx.res.hasHeader("content-length");

    const res = ctx.res;
    const body = res.body;
    if (Buffer.isBuffer(body)) {
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
      throw new Error("Cloudbase don't support streaming! ");
    } else if (body) {
      const strBody = String(body);
      if (writeLength) {
        res.setHeader("content-length", Buffer.byteLength(strBody));
      }
      if (writeType) {
        const type = /^\s*</.test(strBody) ? "html" : "text";
        res.setHeader("content-type", mime.contentType(type) as string);
      }
    }
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

  getBody(event: Record<string, unknown>): unknown {
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
