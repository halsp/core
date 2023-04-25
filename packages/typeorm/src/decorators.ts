import { Inject } from "@halsp/inject";
import { OPTIONS_IDENTITY } from "./constant";
import * as typeorm from "typeorm";

export const Typeorm = (identity?: string) =>
  Inject(OPTIONS_IDENTITY + (identity ?? ""));

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Typeorm extends typeorm.DataSource {}
