import { InjectType } from "@ipare/inject";
import * as knex from "knex";

export type Options<SV extends object = any> = knex.Knex.Config<SV> & {
  injectType?: InjectType;
  identity?: string;
};
