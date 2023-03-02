import { InjectType } from "@halsp/inject";
import * as knex from "knex";

export type Options<SV extends object = any> = knex.Knex.Config<SV> & {
  injectType?: InjectType;
  identity?: string;
};
