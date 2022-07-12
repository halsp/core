import { isObject } from "@ipare/core";
import { OpenApiBuilder, OpenAPIObject } from "openapi3-ts";
import { IGNORE } from "../constant";

export class IgnoreParser {
  private readonly doc: OpenAPIObject;
  constructor(private readonly builder: OpenApiBuilder) {
    this.doc = this.builder.getSpec();
  }

  public parse() {
    this.removeIngore(this.doc, []);
  }

  private removeIngore(obj: any, paths: string[]) {
    if (!obj) return;

    if (Array.isArray(obj)) {
      for (const item of [...obj]) {
        if (this.isIgnore(item)) {
          obj.splice(obj.indexOf(item), 1);
        } else {
          this.removeIngore(item, [...paths, "array"]);
        }
      }
    } else if (isObject(obj)) {
      const keys = Object.keys(obj);
      for (const key of keys) {
        if (this.isIgnore(obj[key])) {
          delete obj[key];
          if (
            paths[paths.length - 1] == "schemas" &&
            paths[paths.length - 2] == "components"
          ) {
            this.removeRef(this.doc, key);
          }
        } else {
          this.removeIngore(obj[key], [...paths, key]);
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

  private removeRef(obj: any, name: string) {
    if (!obj) return;

    if (Array.isArray(obj)) {
      for (const item of [...obj]) {
        if (isObject(item) && item["$ref"] == `#/components/schemas/${name}`) {
          obj.splice(obj.indexOf(item), 1);
        } else {
          this.removeRef(item, name);
        }
      }
    } else if (isObject(obj)) {
      const keys = Object.keys(obj);
      for (const key of keys) {
        const child = obj[key];
        if (
          isObject(child) &&
          child["$ref"] == `#/components/schemas/${name}`
        ) {
          delete obj[key];
        } else {
          this.removeRef(child, name);
        }
      }
    }
  }
}
