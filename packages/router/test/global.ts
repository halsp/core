import * as shell from "shelljs";
import { MvaConfig, RouterConfig } from "../src";

export async function runMva(test: () => Promise<void>): Promise<void> {
  shell.cd("test/mva");
  try {
    await test();
  } finally {
    shell.cd("../..");
  }
}

export const routerCfg: RouterConfig = {
  prefix: "",
  dir: "test/actions",
};

export const testMvcCfg: MvaConfig = {
  routerConfig: routerCfg,
};
