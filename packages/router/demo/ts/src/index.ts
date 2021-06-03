import { Request, SimpleStartup } from "sfa";
import "@sfajs/router";

export const main = async (): Promise<unknown> => {
  return new SimpleStartup(new Request())
    .use(async (ctx, next) => {
      ctx.res.headers.demo = "ts";
      await next();
    })
    .useRouter()
    .run();
};