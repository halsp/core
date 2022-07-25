import { InjectType } from "@ipare/inject";
import winston from "winston";

export interface Options extends winston.LoggerOptions {
  injectType?: InjectType;
  identity?: string;
}
