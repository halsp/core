import * as shell from "shelljs";

export { shell };

export async function runin(path: string, func: () => Promise<void> | void) {
  shell.cd(path);
  try {
    await func();
  } finally {
    shell.cd(process.cwd());
  }
}
