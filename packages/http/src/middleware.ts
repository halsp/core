import { Middleware } from "@halsp/core";
import {
  HeaderHandler,
  initHeaderHandler,
  initResultHandler,
  ResultHandler,
} from "./context";

declare module "@halsp/core" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Middleware extends ResultHandler, HeaderHandler {}
}

initResultHandler(Middleware.prototype, function () {
  return this.res;
});
initHeaderHandler(
  Middleware.prototype,
  function () {
    return this.req.headers;
  },
  function () {
    return this.res.headers;
  },
);
