import { InjectType } from "@ipare/inject";
import typeorm from "typeorm";

export type Options = typeorm.DataSourceOptions & {
  injectType?: InjectType;
  identity?: string;
  initialize?: boolean;
};
