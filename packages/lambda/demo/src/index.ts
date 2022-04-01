import { SfaCloudbase } from "@sfajs/cloudbase";
import { Dict } from "@sfajs/core";

const startup = new SfaCloudbase().use(async (ctx) => {
  ctx.res.setHeader("demo", "@sfajs/cloudbase");
});

export const main = async (
  event: Dict<unknown>,
  context: Dict<unknown>
): Promise<unknown> => {
  return await startup.run(event, context);
};
