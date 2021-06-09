import { SimpleStartup } from "sfa";
import "@sfajs/router";

export const main = async (): Promise<unknown> => {
  return new SimpleStartup().useRouter().run();
};
