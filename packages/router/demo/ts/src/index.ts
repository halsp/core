import { SimpleStartup } from "sfa";
import "@sfajs/router";

export const main = async (): Promise<unknown> => {
  return new SimpleStartup()
    .use(async (ctx, next) => {
      ctx.res.headers.demo = "ts";
      await next();
    })
    .useRouter()
    .run();
};
