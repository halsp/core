import { ObjectConstructor } from "@ipare/core";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Filter {}

export type FilterItem<T extends Filter = Filter> = T | ObjectConstructor<T>;

export interface OrderRecord<T extends Filter = Filter> {
  filter: ObjectConstructor<T>;
  order: number;
}
