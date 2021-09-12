import { TestStartup } from "sfa";
import "@sfajs/router-act";

export const main = async (): Promise<unknown> => {
  return new TestStartup().useRouter().run();
};
