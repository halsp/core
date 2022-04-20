import { PipeTransform } from "./pipe-transform";

export class LambdaPipe<T = any, R = any> implements PipeTransform<T, R> {
  constructor(private readonly handler: (val: T) => R | Promise<R>) {}

  async transform(value: T) {
    return await this.handler(value);
  }
}
