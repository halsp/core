import "reflect-metadata";
import { setActionMetadata } from "./set-action-metadata";

export function SetActionMetadata<T = any>(
  metadataKey: string,
  metadataValue: T
): ClassDecorator {
  return (target: any) => {
    setActionMetadata(target, metadataKey, metadataValue);
  };
}
