import { Inject } from "@halsp/inject";
import { OPTIONS_IDENTITY } from "./constant";
import mongoose from "mongoose";

export const Mongoose = (identity?: string) =>
  Inject(OPTIONS_IDENTITY + (identity ?? ""));

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Mongoose extends mongoose.Connection {}
