import { Startup } from "@sfajs/core";
import { GLOBAL_PIPE_BAG } from "./constant";
import { GlobalPipeType } from "./global-pipe-type";
import { GlobalPipeItem, PipeItem } from "./pipes";

export { Query, Body, Param, Header, Context } from "./decorators";
export {
  PipeTransform,
  PipeItem,
  ParseBoolPipe,
  ParseBoolPipeOptions,
  ParseFloatPipe,
  ParseIntPipe,
  DefaultValuePipe,
  DefaultValuePipeOptions,
  TrimPipe,
  TrimPipeOptions,
} from "./pipes";

export { PIPE_RECORDS_METADATA } from "./constant";
export { PipeReqRecord } from "./pipe-req-record";
export { PipeReqType } from "./pipe-req-type";

declare module "@sfajs/core" {
  interface Startup {
    useGlobalPipe<T = any, R = any>(
      type: GlobalPipeType,
      pipe: PipeItem<T, R>
    ): this;
  }
}

Startup.prototype.useGlobalPipe = function <T = any, R = any>(
  type: GlobalPipeType,
  pipe: PipeItem<T, R>
): Startup {
  return this.use(async (ctx, next) => {
    const pipes = ctx.bag<GlobalPipeItem<T, R>[]>(GLOBAL_PIPE_BAG) ?? [];
    pipes.push({
      pipe,
      type,
    });
    ctx.bag(GLOBAL_PIPE_BAG, pipes);
    await next();
  });
};
