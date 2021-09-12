const { TestStartup } = require("sfa");
import "@sfajs/router-act";

exports.main = async () => {
  return await new TestStartup()
    .use(async (ctx, next) => {
      ctx.res.headers.demo = "js";
      await next();
    })
    .useRouter()
    .run();
};
