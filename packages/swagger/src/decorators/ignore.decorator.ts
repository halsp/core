import { IGNORE } from "../constant";
import { createCallbackDecorator } from "./callback.decorator";
import { dynamicSetValue } from "./dynamic-set-value.decorator";

export function Ignore() {
  return createCallbackDecorator((args) => {
    dynamicSetValue({
      cb: ({ schema }) => {
        schema[IGNORE] = true;
      },
      target: args.target,
      propertyKey: args.propertyKey,
      builder: args.builder,
      pipeRecord: args.pipeRecord,
      schema: args.schema,
      operation: args.operation,
    });
  });
}
