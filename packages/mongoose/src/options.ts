import { InjectType } from "@ipare/inject";
import mongoose from "mongoose";

export type Options = mongoose.ConnectOptions & {
  url: string;
  injectType?: InjectType;
  identity?: string;
};
