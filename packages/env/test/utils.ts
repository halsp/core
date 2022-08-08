import { TestStartup } from "@ipare/testing";
import { EnvOptions } from "../src";
import "../src";

export async function getEnv(options?: EnvOptions | string) {
  process.chdir("test/envs");
  try {
    const res = await new TestStartup()
      .useEnv(options as any)
      .use((ctx) => {
        ctx.ok(process.env);
      })
      .run();
    return res.body;
  } finally {
    process.chdir("../..");
  }
}
