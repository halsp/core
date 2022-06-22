import { Startup } from "@sfajs/core";
import "@sfajs/pipe";
import { GlobalPipeType } from "@sfajs/pipe/dist/global-pipe-type";
import { ValidatePipe } from "./validate.pipe";

declare module "@sfajs/core" {
  interface Startup {
    useValidator(): this;
  }
}

Startup.prototype.useValidator = function (): Startup {
  return this.useGlobalPipe(GlobalPipeType.after, ValidatePipe);
};
