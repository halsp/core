import { InjectType } from "@halsp/inject";
import typeorm from "typeorm";

export type Options = typeorm.DataSourceOptions & {
  injectType?: InjectType;
  identity?: string;
};
