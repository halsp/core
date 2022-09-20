import { Dict, isUndefined, isPlainObject } from "./utils";
import { Startup } from "./startup";

type BuilderBagType = "singleton" | "scoped" | "transient";
type BuilderBagItem<T> = {
  key: string;
  builder: () => T;
  type: BuilderBagType;
  isBuilderBag: true;
};

export class Context {
  readonly startup!: Startup;

  get #singletonBag() {
    const key = "@ipare/core/singletonBag";
    const singletonBag: Dict = this.startup[key] ?? {};
    this.startup[key] = singletonBag;
    return singletonBag;
  }
  readonly #scopedBag: Dict = {};
  readonly #bag: Dict = {};

  public bag<T>(key: string): T;
  public bag<T>(key: string, value: T): this;
  public bag<T>(key: string, type: BuilderBagType, builder: () => T): this;
  public bag<T>(key: string, arg1?: any, arg2?: any): this | T {
    if (!isUndefined(arg1) && !isUndefined(arg2)) {
      this.#bag[key] = <BuilderBagItem<T>>{
        type: arg1,
        builder: arg2,
        isBuilderBag: true,
      };
      return this;
    } else if (!isUndefined(arg1)) {
      this.#bag[key] = arg1;
      return this;
    } else {
      if (key in this.#singletonBag) {
        return this.#getBagValue(key, this.#singletonBag[key]);
      }
      if (key in this.#scopedBag) {
        return this.#getBagValue(key, this.#scopedBag[key]);
      }
      const result: BuilderBagItem<T> | T = this.#bag[key];
      return this.#getBagValue(key, result);
    }
  }

  #getBagValue<T>(key: string, result: BuilderBagItem<T> | T) {
    if (isPlainObject(result) && result.isBuilderBag) {
      if (result.type == "transient") {
        return result.builder();
      } else {
        let dict: Dict;
        if (result.type == "singleton") {
          dict = this.#singletonBag;
        } else {
          dict = this.#scopedBag;
        }

        if (!(key in dict)) {
          dict[key] = result.builder();
        }
        return dict[key];
      }
    } else {
      return result as T;
    }
  }

  readonly errorStack: any[] = [];
  public catchError(err: Error | any): this {
    this.errorStack.push(err);
    return this;
  }
}