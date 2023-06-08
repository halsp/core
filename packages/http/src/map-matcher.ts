import { Context, Dict, normalizePath, Register } from "@halsp/core";
import { HttpMethods } from "./methods";
import { HttpOptions } from "./options";

export interface ParsedRegister {
  methods: string[];
  url: string;
  handler?: Register["handler"];
}

export class MapMatcher {
  constructor(
    private readonly ctx: Context,
    private readonly options: HttpOptions
  ) {
    this.#parsedRegisters = ctx.startup.parsedRegisters;
  }

  #parsedRegisters!: ParsedRegister[];

  public async match() {
    const register = this.getRegister();
    if (!register) return;

    parseParams(this.ctx, register);

    if (register.handler) {
      await register.handler(this.ctx);
    }
  }

  private getRegister(): ParsedRegister | undefined {
    const matchedPaths = this.#parsedRegisters
      .filter((r) => !!r.methods.length)
      .filter((r) => this.isPathMatched(r, true));
    this.#parsedRegisters
      .filter((r) => !r.methods.length || r.methods.includes(HttpMethods.any))
      .filter((m) => this.isPathMatched(m, false))
      .forEach((m) => matchedPaths.push(m));
    const mapItem = this.getMostLikeRegister(matchedPaths);
    if (mapItem) return mapItem;

    const otherMethodPathCount = this.#parsedRegisters.filter((r) =>
      this.isPathMatched(r, false)
    ).length;
    if (otherMethodPathCount) {
      const method = this.ctx.req.method;
      this.ctx.res.methodNotAllowedMsg({
        message: `method not allowed：${method}`,
        method: method,
        path: this.ctx.req.path,
      });
    } else {
      this.ctx.res.notFoundMsg({
        message: `Can't find the path：${this.ctx.req.path}`,
        path: this.ctx.req.path,
      });
    }
  }

  private isPathMatched(
    register: ParsedRegister,
    methodIncluded: boolean
  ): boolean {
    const reqUrl = this.ctx.req.path;
    const reqUrlStrs = reqUrl
      .toLowerCase()
      .split("/")
      .filter((item) => !!item);
    const mapUrlStrs = register.url
      .toLowerCase()
      .split("/")
      .filter((item) => !!item);
    if (reqUrlStrs.length != mapUrlStrs.length) return false;

    if (methodIncluded && !register.methods.includes(HttpMethods.any)) {
      const matchedMethod = HttpMethods.matched(
        this.ctx.req.method,
        this.options.customMethods
      );
      if (!matchedMethod || !register.methods.includes(matchedMethod)) {
        return false;
      }
    }

    for (let i = 0; i < mapUrlStrs.length; i++) {
      if (mapUrlStrs[i] != reqUrlStrs[i] && !mapUrlStrs[i].startsWith("^")) {
        return false;
      }
    }
    return true;
  }

  private getMostLikeRegister(
    registers: ParsedRegister[]
  ): ParsedRegister | undefined {
    if (!registers || !registers.length) return;
    if (registers.length == 1) return registers[0];

    const pathsParts = <{ register: ParsedRegister; parts: string[] }[]>[];
    registers.forEach((register) => {
      pathsParts.push({
        register: register,
        parts: register.url
          .toLowerCase()
          .split("/")
          .filter((item) => !!item),
      });
    });

    const minPartsCount = Math.min(...pathsParts.map((pp) => pp.parts.length));
    for (let i = 0; i < minPartsCount; i++) {
      if (
        pathsParts.some((p) => p.parts[i].includes("^")) &&
        pathsParts.some((p) => !p.parts[i].includes("^"))
      ) {
        pathsParts
          .filter((p) => p.parts[i].includes("^"))
          .forEach((p) => pathsParts.splice(pathsParts.indexOf(p), 1));
      }

      if (pathsParts.length == 1) return pathsParts[0].register;
    }

    if (
      pathsParts.some((pp) => pp.register.methods.includes(HttpMethods.any)) &&
      pathsParts.some((pp) => !pp.register.methods.includes(HttpMethods.any))
    ) {
      pathsParts
        .filter((pp) => pp.register.methods.includes(HttpMethods.any))
        .forEach((pp) => {
          pathsParts.splice(pathsParts.indexOf(pp), 1);
        });
    }

    return pathsParts.sort((a, b) => a.parts.length - b.parts.length)[0]
      .register;
  }
}

export function parsePattern(register: Register): ParsedRegister {
  const strs = register.pattern.trim().split("//");
  if (strs.length <= 1) {
    return {
      methods: [],
      url: normalizePath(strs[0]),
      handler: register.handler,
    };
  } else {
    return {
      methods: strs[0]
        .split(",")
        .filter((m) => !!m)
        .map((m) => m.toUpperCase()),
      url: normalizePath(strs[1]),
      handler: register.handler,
    };
  }
}

function parseParams(ctx: Context, register: ParsedRegister) {
  const params: Dict<string> = {};
  if (register.url.includes("^")) {
    const mapPathStrs = register.url.split("/").filter((item) => !!item);
    const reqPathStrs = ctx.req.path.split("/").filter((item) => !!item);
    for (let i = 0; i < Math.min(mapPathStrs.length, reqPathStrs.length); i++) {
      const mapPathStr = mapPathStrs[i];
      if (!mapPathStr.startsWith("^")) continue;
      const reqPathStr = reqPathStrs[i];

      const key = mapPathStr.substring(1, mapPathStr.length);
      const value = decodeURIComponent(reqPathStr);

      params[key] = value;
    }
  }

  Object.defineProperty(ctx.req, "params", {
    configurable: true,
    enumerable: true,
    get: () => {
      return params;
    },
  });
  Object.defineProperty(ctx.req, "param", {
    configurable: true,
    enumerable: true,
    get: () => {
      return params;
    },
  });
}
