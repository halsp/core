export type Dict<T = any> = {
  [key: string]: T;
};
export type ReadonlyDict<T = any> = {
  readonly [key: string]: T;
};
export type ObjectConstructor<T extends object = any> = {
  new (...args: any[]): T;
};
