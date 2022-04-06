import "@sfajs/core";
import { Startup } from "@sfajs/core";
import { parseReqDeco } from "./req-deco-parser";

export { Query, Body, Param, Header, Ctx, ReqParse } from "./decorators";

declare module "@sfajs/core" {
  interface Startup {
    useReqParse(): this;
  }
}

Startup.prototype.useReqParse = function (): Startup {
  if ((this as any).useReqParsed) {
    return this;
  }
  (this as any).useReqParsed = true;
  this.hook((ctx, mh) => {
    parseReqDeco(ctx, mh);
  });
  return this;
};

export { parseReqDeco };
