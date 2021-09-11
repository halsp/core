import * as shell from "shelljs";
import { MvaConfig, RouterConfig } from "../src";

async function runMva(test: () => Promise<void>): Promise<void> {
  shell.cd("test/mva");
  try {
    await test();
  } finally {
    shell.cd("../..");
  }
}

export { runMva };

export default {
  users: [
    {
      account: "abc",
      password: "123456",
    },
    {
      account: "admin",
      password: "abcdef",
    },
  ],
  adminAccount: "admin",
};

export const routerCfg: RouterConfig = {
  prefix: "",
  dir: "test/actions",
};

export const testMvcCfg: MvaConfig = {
  routerConfig: routerCfg,
};
