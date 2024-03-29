import { Action } from "../action";
import { Dict, ObjectConstructor } from "@halsp/core";
import { ACTION_METADATA } from "../constant";

export function getActionMetadata(
  target: ObjectConstructor<Action> | Action,
): Dict;
export function getActionMetadata<T = any>(
  target: ObjectConstructor<Action> | Action,
  metadataKey: string,
): T;
export function getActionMetadata<T = any>(
  target: ObjectConstructor<Action> | Action,
  metadataKey?: string,
): T | Dict {
  if (target instanceof Action) {
    target = target.constructor as ObjectConstructor<Action>;
  }

  const metadata = Reflect.getMetadata(ACTION_METADATA, target.prototype);
  if (metadataKey) {
    return metadata?.[metadataKey];
  } else {
    return metadata;
  }
}

export function setActionMetadata<T>(
  target: ObjectConstructor<Action> | Action,
  metadataKey: string,
  metadataValue: T,
) {
  if (target instanceof Action) {
    target = target.constructor as ObjectConstructor<Action>;
  }

  const metadata = Reflect.getMetadata(ACTION_METADATA, target.prototype) ?? {};
  Reflect.defineMetadata(
    ACTION_METADATA,
    {
      ...metadata,
      [metadataKey]: metadataValue,
    },
    target.prototype,
  );
}

export function ActionMetadata<T = any>(
  metadataKey: string,
  metadataValue: T,
): ClassDecorator {
  return (target: any) => {
    setActionMetadata(target, metadataKey, metadataValue);
  };
}

/** @deprecated Please use ActionMetadata */
export const SetActionMetadata = ActionMetadata;
