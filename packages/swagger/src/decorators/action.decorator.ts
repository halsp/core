import { getActionMetadata, setActionMetadata } from "@ipare/router";
import {
  CallbacksObject,
  ExternalDocumentationObject,
  OperationObject,
  ResponsesObject,
  SecurityRequirementObject,
  ServerObject,
} from "openapi3-ts";
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

export function ApiTags(...value: string[]) {
  return createActionDecorator((operation) => {
    operation.tags = value;
  });
}

export function ApiSummary(value: string) {
  return createActionDecorator((operation) => {
    operation.summary = value;
  });
}

export function ApiDescription(value: string) {
  return createActionDecorator((operation) => {
    operation.description = value;
  });
}

export function ApiExternalDocs(value: ExternalDocumentationObject) {
  return createActionDecorator((operation) => {
    operation.externalDocs = value;
  });
}

export function ApiDeprecated() {
  return createActionDecorator((operation) => {
    operation.deprecated = true;
  });
}

export function ApiServers(...value: ServerObject[]) {
  return createActionDecorator((operation) => {
    operation.servers = value;
  });
}

export function ApiSecurity(...value: SecurityRequirementObject[]) {
  return createActionDecorator((operation) => {
    operation.security = value;
  });
}

export function ApiCallback(value: CallbacksObject) {
  return createActionDecorator((operation) => {
    operation.callbacks = value;
  });
}

export function ApiResponses(value: ResponsesObject) {
  return createActionDecorator((operation) => {
    operation.responses = value;
  });
}

export function ApiOperationId(value: string) {
  return createActionDecorator((operation) => {
    operation.operationId = value;
  });
}
