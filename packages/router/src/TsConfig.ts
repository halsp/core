import { existsSync } from "fs";
import * as path from "path";

export interface TsStaticItemConfig {
  source: string;
  target: string;
}

export default class TsConfig {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static get cfg(): any | null {
    const tsconfigPath = path.join(process.cwd(), "tsconfig.json");
    if (existsSync(tsconfigPath)) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      return require(tsconfigPath);
    } else {
      return null;
    }
  }

  public static get outDir(): string {
    return this.cfg?.compilerOptions?.outDir ?? "";
  }
  public static get tsStatic(): (TsStaticItemConfig | string)[] {
    return this.cfg?.static ?? [];
  }
}
