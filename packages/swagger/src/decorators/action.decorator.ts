import { getActionMetadata, setActionMetadata } from "@sfajs/router";
import { OperationObject } from "openapi3-ts";
import { ACTION_DECORATORS } from "../constant";

export type ActionCallback = (operation: OperationObject) => void;

export function createActionDecorator(cb: ActionCallback) {
  return function (target: any) {
    const cbs =
      getActionMetadata<ActionCallback[]>(
        target.prototype,
        ACTION_DECORATORS
      ) ?? [];
    cbs.push(cb);
    setActionMetadata(target.prototype, ACTION_DECORATORS, cbs);
  };
}

export function ApiTags(...tags: string[]) {
  return createActionDecorator((operation) => {
    operation.tags = tags;
  });
}

export function ApiSummary(summary: string) {
  return createActionDecorator((operation) => {
    operation.summary = summary;
  });
}
