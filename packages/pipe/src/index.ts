import "@sfajs/core";
import { Startup } from "@sfajs/core";
import { IS_REQ_DECO_USED } from "./constant";
import { parseReqDeco } from "./req-deco-parser";

export { Query, Body, Param, Header, Ctx, ReqParse } from "./decorators";

declare module "@sfajs/core" {
  interface Startup {
    useReqDeco(): this;
  }
}

Startup.prototype.useReqDeco = function (): Startup {
  if (this[IS_REQ_DECO_USED]) {
    return this;
  }
  this[IS_REQ_DECO_USED] = true;
  this.hook((ctx, mh) => {
    parseReqDeco(ctx, mh);
  });
  return this;
};

export { parseReqDeco };
