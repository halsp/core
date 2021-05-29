import { Request, Startup } from "sfa";
import "sfa-router";

export const main = async (): Promise<unknown> => {
  return new Startup(new Request()).useRouter().invoke();
};
