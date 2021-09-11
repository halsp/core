import { TestStartup } from "sfa";
import "@sfajs/mva";

export const main = async (): Promise<unknown> => {
  return new TestStartup().useRouter().run();
};
