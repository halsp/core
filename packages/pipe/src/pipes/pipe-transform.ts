export interface PipeTransform<T = any, R = any> {
  transform(value: T): Promise<R> | R;
}
