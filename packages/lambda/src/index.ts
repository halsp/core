import { Request, Startup } from "sfa";
import ResponseStruct from "./ResponseStruct";

declare module "sfa" {
  interface Request {
    readonly isBase64Encoded: boolean;
    readonly context: Record<string, unknown>;
    readonly event: Record<string, unknown>;
  }
  interface Response {
    isBase64Encoded: boolean;
  }
}

export { ResponseStruct };

export default class SfaCloudbase extends Startup {
  constructor(
    context: Record<string, unknown>,
    event: Record<string, unknown>
  ) {
    super(
      new Request()
        .setData(event.data)
        .setMethod(event.httpMethod as string)
        .setHeaders(...getPairs<string | string[] | undefined>(event.headers))
        .setParams(...getPairs<string | undefined>(event.queryStringParameters))
        .setPath(event.path as string)
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.ctx.req as any).context = context;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.ctx.req as any).event = event;
  }

  async run(): Promise<ResponseStruct> {
    await super.invoke();
    return this.struct;
  }

  get struct(): ResponseStruct {
    return <ResponseStruct>{
      headers: this.ctx.res?.headers ?? {},
      statusCode: this.ctx.res?.status ?? 0,
      isBase64Encoded: this.ctx.res?.isBase64Encoded ?? false,
      body: this.ctx.res?.body ?? {},
    };
  }
}

function getPairs<T>(map: unknown) {
  return Object.keys(map as Record<string, T>[]).map((key) => ({
    key: key,
    value: (map as Record<string, T>)["key"],
  }));
}
