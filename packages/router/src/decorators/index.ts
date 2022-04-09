import { Dict, ObjectConstructor } from "@sfajs/core";
import "reflect-metadata";
import Action from "../action";
import { METADATA } from "../constant";

export function setActionMetadata(
  target: ObjectConstructor<Action>,
  metadata: Dict,
  replace = false
) {
  const exist = Reflect.getMetadata(METADATA, target);
  if (!!exist && !replace) {
    metadata = Object.assign({}, exist, metadata);
  }
  Reflect.defineMetadata(METADATA, metadata, target);
}

export function getActionMetadata(target: ObjectConstructor<Action>) {
  return Reflect.getMetadata(METADATA, target);
}

export function ActionMetadata(metadata: Record<string, any>): ClassDecorator {
  return function (target: any) {
    setActionMetadata(target, metadata);
  };
}
