import { HttpContext } from "@sfajs/core";

export interface PipeTransform<T = any, R = any> {
  transform(value: T, ctx: HttpContext, propertyType: any): Promise<R> | R;
}
