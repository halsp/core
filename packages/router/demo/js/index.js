const { Request, SimpleStartup } = require("sfa");
import "sfa-router";

exports.main = async () => {
  return await new SimpleStartup(new Request())
    .use(async (ctx, next) => {
      ctx.res.headers.demo = "js";
      await next();
    })
    .useRouter<SimpleStartup>()
    .run();
};
