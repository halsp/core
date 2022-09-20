import { HttpStartup } from "@ipare/http";
import { GLOBAL_PIPE_BAG } from "./constant";
import { GlobalPipeType } from "./global-pipe-type";
import { GlobalPipeItem, PipeItem } from "./pipes";

export { Query, Body, Param, Header, InjectContext } from "./decorators";
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
} from "./pipes";

export { PipeReqRecord, getPipeRecords } from "./pipe-req-record";
export { PipeReqType } from "./pipe-req-type";

declare module "@ipare/http" {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  interface HttpStartup {
    useGlobalPipe<T = any, R = any>(
      type: GlobalPipeType,
      pipe: PipeItem<T, R>
    ): this;
  }
}

HttpStartup.prototype.useGlobalPipe = function <T = any, R = any>(
  type: GlobalPipeType,
  pipe: PipeItem<T, R>
): HttpStartup {
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
