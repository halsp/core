import SfaCloudbase from "@sfajs/cloudbase";
import { SfaUtils } from "sfa";

const startup = new SfaCloudbase().use(async (ctx) => {
  ctx.res.setHeader("demo", "@sfajs/cloudbase");
});

export const main = async (
  event: SfaUtils.Dict<unknown>,
  context: SfaUtils.Dict<unknown>
): Promise<unknown> => {
  return await startup.run(event, context);
};
