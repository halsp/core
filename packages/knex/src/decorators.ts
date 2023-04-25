import { Inject } from "@halsp/inject";
import { OPTIONS_IDENTITY } from "./constant";
import * as knex from "knex";

export const Knex = (identity?: string) =>
  Inject(OPTIONS_IDENTITY + (identity ?? ""));

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Knex extends knex.Knex {}
