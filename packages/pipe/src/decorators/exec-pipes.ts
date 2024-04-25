import { Context, isClass, ObjectConstructor } from "@halsp/core";
import { PipeItem } from "../pipe-item";
import { GlobalPipeItem, GlobalPipeType } from "../global";
import { LambdaPipe } from "../presets";
import { GLOBAL_PIPE_BAG } from "../constant";

export async function execPipes<T extends object = any>(
  ctx: Context,
  parent: T,
  target: ObjectConstructor<T>,
  property: string | undefined,
  propertyKey: string | symbol,
  parameterIndex: number | undefined,
  value: any,
  propertyType: any,
  pipes: PipeItem[],
) {
  const globalPipes = ctx.get<GlobalPipeItem[]>(GLOBAL_PIPE_BAG) ?? [];
  const beforeGlobalPipes = globalPipes
    .filter((p) => p.type == GlobalPipeType.before)
    .map((item) => item.pipe);
  const afterGlobalPipes = globalPipes
    .filter((p) => p.type == GlobalPipeType.after)
    .map((item) => item.pipe);

  for (let pipe of [...beforeGlobalPipes, ...pipes, ...afterGlobalPipes]) {
    if (isClass(pipe)) {
      pipe = await ctx.getService(pipe);
    } else if (typeof pipe == "function") {
      pipe = new LambdaPipe(pipe);
    }

    if (pipe.transform) {
      value = await pipe.transform({
        value,
        parent,
        ctx,
        propertyType,
        target,
        propertyKey,
        parameterIndex,
        pipes,
        property,
      });
    }
  }
  return value;
}
