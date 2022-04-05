import "@sfajs/core";
import { Startup } from "@sfajs/core";
import { parseReq } from "./req-parser";

export { Query, Body, Param, Header } from "./decorators";

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
    parseReq(ctx, mh);
  });
  return this;
};

export { parseReq };
