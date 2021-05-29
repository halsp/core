const { Request, Startup } = require("sfa");
import "sfa-router";

exports.main = async () => {
  return await new Startup(new Request())
    .use(async (ctx, next) => {
      ctx.res.headers.demo = "js";
      await next();
    })
    .useRouter()
    .invoke();
};
