import { PipeTransform, TransformArgs } from "./pipe-transform";

export class LambdaPipe<T = any, R = any> implements PipeTransform<T, R> {
  constructor(
    private readonly handler: (args: TransformArgs<T>) => R | Promise<R>
  ) {}

  async transform(args: TransformArgs<T>) {
    return await this.handler(args);
  }
}
