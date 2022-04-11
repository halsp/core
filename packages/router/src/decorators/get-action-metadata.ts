import Action from "../action";
import { Dict, ObjectConstructor } from "@sfajs/core";
import { ACTION_METADATA } from "../constant";

export function getActionMetadata(
  target: ObjectConstructor<Action> | Action
): Dict;
export function getActionMetadata<T = any>(
  target: ObjectConstructor<Action> | Action,
  metadataKey: string
): T;
export function getActionMetadata<T = any>(
  target: ObjectConstructor<Action> | Action,
  metadataKey?: string
): T | Dict {
  if (target instanceof Action) {
    target = target.constructor as ObjectConstructor<Action>;
  }

  const metadata = Reflect.getMetadata(ACTION_METADATA, target);
  if (metadataKey) {
    return metadata[metadataKey];
  } else {
    return metadata;
  }
}
