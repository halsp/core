import { Startup } from "@halsp/core";
import { GLOBAL_PIPE_BAG } from "./constant";
import { GlobalPipeType } from "./global/global-pipe-type";
import { PipeItem } from "./pipe-item";
import { GlobalPipeItem } from "./global";

export { Query, Body, Param, Header, Property } from "./decorators";
export { TransformArgs } from "./pipe-transform";
export { PipeReqType } from "./pipe-req-type";
export { PipeItem } from "./pipe-item";
export { PipeTransform } from "./pipe-transform";
export {
  ParseBoolPipe,
  ParseBoolPipeOptions,
  ParseFloatPipe,
  ParseIntPipe,
  DefaultValuePipe,
  DefaultValuePipeOptions,
  TrimPipe,
  TrimPipeOptions,
} from "./presets";

export { PipeReqRecord, getPipeRecords } from "./pipe-req-record";
export { GlobalPipeType };

declare module "@halsp/core" {
  interface Startup {
    useGlobalPipe<T = any, R = any>(
      type: GlobalPipeType,
      pipe: PipeItem<T, R>,
    ): this;
  }
}

Startup.prototype.useGlobalPipe = function <T = any, R = any>(
  type: GlobalPipeType,
  pipe: PipeItem<T, R>,
) {
  return this.use(async (ctx, next) => {
    const pipes = ctx.get<GlobalPipeItem<T, R>[]>(GLOBAL_PIPE_BAG) ?? [];
    pipes.push({
      pipe,
      type,
    });
    ctx.set(GLOBAL_PIPE_BAG, pipes);
    await next();
  });
};
