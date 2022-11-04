import { Middleware } from "@ipare/core";

export abstract class Action extends Middleware {}

export * from "./action-metadata";
export * from "./http-method.decorator";
export * from "./pattern.decorator";
