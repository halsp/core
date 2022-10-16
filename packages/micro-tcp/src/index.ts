import { Context } from "@ipare/core";
import { Message } from "./context";
export { MicroTcpStartup } from "./startup";
export { MicroTcpOptions } from "./options";
export { createContext, Message } from "./context";

declare module "@ipare/core" {
  interface Context {
    get message(): Message;
    get msg(): Message;
    result: any;
    setResult(result: any): this;
  }
}

Context.prototype.setResult = function (result: any) {
  this.result = result;
  return this;
};
