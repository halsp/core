import SfaCloudbase from "@sfajs/cloudbase";

export const main = async (
  event: Record<string, unknown>,
  context: Record<string, unknown>
): Promise<unknown> => {
  return new SfaCloudbase(event, context)
    .use(async (ctx) => {
      ctx.res.headers.demo = "@sfajs/cloudbase";
    })
    .run();
};
