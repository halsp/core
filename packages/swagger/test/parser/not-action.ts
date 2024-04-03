import { Header } from "@halsp/pipe";
import "reflect-metadata";

export function func() {
  return 0;
}

export const num = 0;

export class TestClass {
  @Header()
  testProp: any;
}
