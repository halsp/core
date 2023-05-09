import { Context, Response, Request, Startup } from "../src";

declare module "../src" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Startup {
    run(ctx?: Context | Request): Promise<Response>;
  }
}

Startup.prototype.run = async function (ctx?: Context | Request) {
  return await this["invoke"](ctx);
};
