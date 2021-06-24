import SfaCloudbase from "@sfajs/cloudbase";

export const main = async (
  event: Record<string, unknown>,
  context: Record<string, unknown>
): Promise<unknown> => {
  return new SfaCloudbase(event, context)
    .use(async (ctx) => {
      ctx.res.setHeader("demo", "@sfajs/cloudbase");
    })
    .run();
};
