import { Context, ObjectConstructor } from "@halsp/common";
import { PipeItem } from "./pipe";

export interface TransformArgs<T = any, U extends object = any> {
  value: T;
  ctx: Context;
  propertyType: any;
  target: ObjectConstructor<U>;
  parent: U;
  propertyKey: string | symbol;
  parameterIndex?: number;
  pipes: PipeItem[];
  property?: string;
}

export interface PipeTransform<T = any, R = any> {
  transform(args: TransformArgs<T>): Promise<R> | R;
}
