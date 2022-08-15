export async function runin(path: string, func: () => Promise<void> | void) {
  const root = process.cwd();
  process.chdir(path);
  try {
    await func();
  } finally {
    process.chdir(root);
  }
}
