import { Middleware } from "@sfajs/core";

export abstract class Action extends Middleware {}

export * from "./get-action-metadata";
export * from "./set-action-metadata";
