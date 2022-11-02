import { InjectType } from "@ipare/inject";
import winston from "winston";
import { FileTransportOptions } from "winston/lib/winston/transports";

export interface Options extends winston.LoggerOptions {
  injectType?: InjectType;
}

export interface FileOptions extends Options {
  fileTransportOptions?: FileTransportOptions;
}
