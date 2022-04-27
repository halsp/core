import { ObjectConstructor } from "@sfajs/core";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Filter {}

export type FilterItem = Filter | ObjectConstructor<Filter>;
