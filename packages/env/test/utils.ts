import { TestStartup } from "@ipare/testing";
import { EnvOptions } from "../src";
import "../src";

export async function getEnv(options?: EnvOptions | string) {
  process.chdir("test/envs");
  try {
    const { ctx } = await new TestStartup()
      .useEnv(options as any)
      .use((ctx) => {
        ctx.bag("env", process.env);
      })
      .run();
    return ctx.bag<typeof process.env>("env");
  } finally {
    process.chdir("../..");
  }
}
