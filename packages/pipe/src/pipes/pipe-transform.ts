import { HttpContext } from "@sfajs/core";
import { PipeItem } from "./pipe";

export interface TransformArgs<T = any> {
  value: T;
  ctx: HttpContext;
  propertyType: any;
  target: any;
  propertyKey: string | symbol;
  parameterIndex?: number;
  pipes: PipeItem[];
}

export interface PipeTransform<T = any, R = any> {
  transform(args: TransformArgs<T>): Promise<R> | R;
}
