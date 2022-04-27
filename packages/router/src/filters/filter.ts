import { ObjectConstructor } from "@sfajs/core";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Filter extends Object {}

export type FilterItem<T extends Filter = Filter> = T | ObjectConstructor<T>;
