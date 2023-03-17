import { Context, Request, Response, Startup } from "@halsp/common";
import { GLOBAL_PIPE_BAG } from "./constant";
import { GlobalPipeType } from "./global-pipe-type";
import { GlobalPipeItem, PipeItem } from "./pipes";

export { Query, Body, Payload, Param, Header, Ctx } from "./decorators";
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
  TransformArgs,
  PipeReqType,
} from "./pipes";

export { PipeReqRecord, getPipeRecords } from "./pipe-req-record";

declare module "@halsp/common" {
  interface Startup {
    useGlobalPipe<T = any, R = any>(
      type: GlobalPipeType,
      pipe: PipeItem<T, R>
    ): this;
  }
}

Startup.prototype.useGlobalPipe = function <T = any, R = any>(
  this: Startup<Request, Response, Context<Request, Response>>,
  type: GlobalPipeType,
  pipe: PipeItem<T, R>
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
