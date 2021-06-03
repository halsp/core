import SfaCloudbase from "@sfajs/cloudbase";
import "@sfajs/router";

export const main = async (
  event: Record<string, unknown>,
  context: Record<string, unknown>
): Promise<unknown> => {
  return new SfaCloudbase(event, context)
    .use(async (ctx, next) => {
      ctx.res.headers.demo = "@sfajs/cloudbase";
      await next();
    })
    .useRouter()
    .run();
};
