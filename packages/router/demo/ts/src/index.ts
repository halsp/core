import { Request, Startup } from "sfa";
import "sfa-router";

export const main = async (): Promise<unknown> => {
  return new Startup(new Request())
    .use(async (ctx, next) => {
      ctx.res.headers.demo = "ts";
      await next();
    })
    .useRouter()
    .invoke();
};
