import { IGNORE } from "../constant";
import { createCallbackDecorator } from "./callback.decorator";
import { dynamicSetPropertyValue } from "./property.decorator";

export function Ignore() {
  return createCallbackDecorator((args) => {
    dynamicSetPropertyValue({
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
