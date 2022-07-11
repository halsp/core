import { Action } from "../action";
import { ObjectConstructor } from "@ipare/core";
import { ACTION_METADATA } from "../constant";

export function setActionMetadata<T>(
  target: ObjectConstructor<Action> | Action,
  metadataKey: string,
  metadataValue: T
) {
  if (target instanceof Action) {
    target = target.constructor as ObjectConstructor<Action>;
  }

  const metadata = Reflect.getMetadata(ACTION_METADATA, target.prototype) ?? {};
  metadata[metadataKey] = metadataValue;
  Reflect.defineMetadata(ACTION_METADATA, metadata, target.prototype);
}
