import "reflect-metadata";
import { JWT_JSON, JWT_PARSE_METADATA, JWT_PAYLOAD, JWT_STR } from "./constant";

function createPropertyDecorator(
  target: any,
  propertyKey: string | symbol,
  key: string
): void {
  const args = (Reflect.getMetadata(key, target) as (string | symbol)[]) ?? [];
  args.push(propertyKey);
  Reflect.defineMetadata(key, args, target);
}

export function JwtToken(target: any, propertyKey: string | symbol): void {
  createPropertyDecorator(target, propertyKey, JWT_STR);
}

export function JwtObject(target: any, propertyKey: string | symbol): void {
  createPropertyDecorator(target, propertyKey, JWT_JSON);
}

export function JwtPayload(target: any, propertyKey: string | symbol): void {
  createPropertyDecorator(target, propertyKey, JWT_PAYLOAD);
}

export function JwtParse(target: any, propertyKey: string | symbol): void {
  const args =
    (Reflect.getMetadata(JWT_PARSE_METADATA, target) as (string | symbol)[]) ??
    [];
  args.push(propertyKey);
  Reflect.defineMetadata(JWT_PARSE_METADATA, args, target);
}
