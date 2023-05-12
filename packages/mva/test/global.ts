import { runin } from "@halsp/testing";

export async function runMva(test: () => Promise<void>): Promise<void> {
  await runin("test/mva", test);
}
