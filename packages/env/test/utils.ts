import { TestStartup } from "@ipare/core";
import { EnvOptions } from "../src";
import "../src";

export async function getEnv(options?: EnvOptions | string) {
  process.chdir("test/envs");
  try {
    const res = await new TestStartup()
      .useConfig(options as any)
      .use(async (ctx) => {
        ctx.ok(process.env);
      })
      .run();
    return res.body;
  } finally {
    process.chdir("../..");
  }
}
