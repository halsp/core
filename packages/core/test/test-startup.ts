import { Context, Response, Startup } from "../src";

declare module "../src" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Startup {
    run(ctx?: Context): Promise<Response>;
  }
}

Startup.prototype.run = async function (ctx?: Context) {
  return await this["invoke"](ctx);
};
