import { IGNORE } from "../constant";
import { createPropertySetValueCallbackDecorator } from "./property.decorator";

export function Ignore() {
  return createPropertySetValueCallbackDecorator(({ schema }) => {
    schema[IGNORE] = true;
  });
}
