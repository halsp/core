import { Middleware } from "@halsp/common";

export abstract class Action extends Middleware {}

export * from "./action-metadata";
export * from "./http-method.decorator";
export * from "./pattern.decorator";
