import { existsSync, readFileSync } from "fs";
import * as path from "path";

export interface TsStaticItemConfig {
  source: string;
  target: string;
}

export default class TsConfig {
  private static _cfg: unknown | null | undefined = undefined;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static get cfg(): any | null {
    if (this._cfg != undefined) {
      return this._cfg;
    }
    const tsconfigPath = path.join(process.cwd(), "tsconfig.json");
    if (existsSync(tsconfigPath)) {
      this._cfg = JSON.parse(readFileSync(tsconfigPath, "utf-8"));
    } else {
      this._cfg = null;
    }
    return this._cfg;
  }

  public static get outDir(): string {
    return this.cfg?.compilerOptions?.outDir ?? "";
  }
  public static get tsStatic(): (TsStaticItemConfig | string)[] {
    return this.cfg?.static ?? [];
  }
}
