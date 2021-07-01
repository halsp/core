import { ICloudBaseConfig } from "@cloudbase/node-sdk";
import { HttpContext, Request, Startup } from "sfa";
import ResponseStruct from "./ResponseStruct";
import tcb = require("@cloudbase/node-sdk");
import Dbhelper from "./Dbhelper";
import { SfaUtils } from "sfa";

declare module "sfa" {
  interface Request {
    readonly context: SfaUtils.Dict<unknown>;
    readonly event: SfaUtils.Dict<unknown>;
  }
}

export { ResponseStruct, Dbhelper };

export default class SfaCloudbase extends Startup {
  async run(
    event: SfaUtils.Dict<unknown>,
    context: SfaUtils.Dict<unknown>
  ): Promise<ResponseStruct> {
    const ctx = this.createContext(event, context);
    await super.invoke(ctx);
    return this.getStruct(ctx);
  }

  private createContext(
    event: SfaUtils.Dict<unknown>,
    context: SfaUtils.Dict<unknown>
  ): HttpContext {
    const ctx = new HttpContext(
      new Request()
        .setBody(this.getBody(event))
        .setMethod(event.httpMethod as string)
        .setHeaders((event.headers ?? {}) as SfaUtils.HeadersDict)
        .setQuery((event.queryStringParameters ?? {}) as SfaUtils.Dict<string>)
        .setPath(event.path as string)
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ctx.req as any).context = context;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ctx.req as any).event = event;
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

  private getBody(event: SfaUtils.Dict<unknown>): unknown {
    const body = event.body;
    const headers = event.headers as SfaUtils.HeadersDict;
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
