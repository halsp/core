const { TestStartup } = require("@sfajs/core");
import "@sfajs/router";

exports.main = async () => {
  return await new TestStartup()
    .use(async (ctx, next) => {
      ctx.res.headers.demo = "js";
      await next();
    })
    .useRouter()
    .run();
};
