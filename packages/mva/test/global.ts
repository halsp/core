import * as shell from "shelljs";

export async function runMva(test: () => Promise<void>): Promise<void> {
  shell.cd("test/mva");
  try {
    await test();
  } finally {
    shell.cd("../..");
  }
}
