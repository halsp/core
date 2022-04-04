import "@sfajs/core";
import { Startup } from "@sfajs/core";

import {
  Inject,
  parseInject,
  InjectDecoratorTypes,
  InjectDecoratorMiddleware,
} from "./decorators";

declare module "@sfajs/core" {
  interface Startup {
    useInject<T extends this>(): T;
  }
}

Startup.prototype.useInject = function <T extends Startup>(): T {
  this.add(InjectDecoratorMiddleware).hook((ctx, mh) => {
    parseInject(ctx, mh);
  });

  return this as T;
};

export { Inject, parseInject, InjectDecoratorTypes };
