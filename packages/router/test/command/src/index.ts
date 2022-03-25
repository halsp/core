import { TestStartup } from "@sfajs/core";
import "@sfajs/router";

export const main = async (): Promise<unknown> => {
  return new TestStartup().useRouter().run();
};
