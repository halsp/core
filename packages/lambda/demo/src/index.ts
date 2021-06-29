import SfaCloudbase from "@sfajs/cloudbase";

const startup = new SfaCloudbase().use(async (ctx) => {
  ctx.res.setHeader("demo", "@sfajs/cloudbase");
});

export const main = async (
  event: Record<string, unknown>,
  context: Record<string, unknown>
): Promise<unknown> => {
  return await startup.run(event, context);
};
