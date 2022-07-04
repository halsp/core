import { isObject } from "@sfajs/core";
import { OpenApiBuilder } from "openapi3-ts";
import { IGNORE } from "../constant";

export class IgnoreParser {
  constructor(private readonly builder: OpenApiBuilder) {}

  public parse() {
    const doc = this.builder.getSpec();

    this.removeIngore(doc);
  }

  private removeIngore(obj: any) {
    if (!obj) return;

    if (Array.isArray(obj)) {
      for (const item of [...obj]) {
        if (this.isIgnore(item)) {
          obj.splice(obj.indexOf(item), 1);
        } else {
          this.removeIngore(item);
        }
      }
    } else if (isObject(obj)) {
      const keys = Object.keys(obj);
      for (const key of keys) {
        if (this.isIgnore(obj[key])) {
          delete obj[key];
        } else {
          this.removeIngore(obj[key]);
        }
      }
    }
  }

  private isIgnore(obj: any) {
    if (!obj) return false;

    if (Array.isArray(obj)) {
      return false;
    } else if (isObject(obj)) {
      return obj[IGNORE];
    } else {
      return false;
    }
  }
}
