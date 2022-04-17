import "reflect-metadata";
import { JWT_JSON, JWT_PAYLOAD, JWT_STR } from "./constant";

function createPropertyDecorator(
  target: any,
  propertyKey: string | symbol,
  key: string
): void {
  const args = (Reflect.getMetadata(key, target) as (string | symbol)[]) ?? [];
  args.push(propertyKey);
  Reflect.defineMetadata(key, args, target);
}

export function JwtStr(target: any, propertyKey: string | symbol): void {
  createPropertyDecorator(target, propertyKey, JWT_STR);
}

export function JwtJson(target: any, propertyKey: string | symbol): void {
  createPropertyDecorator(target, propertyKey, JWT_JSON);
}

export function JwtPayload(target: any, propertyKey: string | symbol): void {
  createPropertyDecorator(target, propertyKey, JWT_PAYLOAD);
}
