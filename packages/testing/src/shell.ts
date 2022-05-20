import * as shell from "shelljs";

export { shell };

export async function runin(path: string, func: () => Promise<void> | void) {
  const root = process.cwd();
  shell.cd(path);
  try {
    await func();
  } finally {
    shell.cd(root);
  }
}
