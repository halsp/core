import { InjectType } from "@ipare/inject";
import mongoose from "mongoose";

export type Options = mongoose.ConnectOptions & {
  injectType?: InjectType;
  identity?: string;
};
