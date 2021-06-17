import { existsSync, lstatSync, readFileSync } from "fs";
import * as path from "path";
import ApiDocsConfig from "./ApiDocs/ApiDocsConfig";
import Constant from "./Constant";

export interface AppConfig {
  router?: RouterConfig;
  ts?: TsConfig;
  doc?: ApiDocsConfig;
}

export interface RouterConfig {
  dir?: string;
  strict?: boolean;
}

export interface TsStaticItemConfig {
  source: string;
  target: string;
}

export interface TsConfig {
  static?: (TsStaticItemConfig | string)[];
}

export default class Config {
  private static _default?: AppConfig = undefined;
  public static get default(): AppConfig {
    if (this._default) return this._default;

    const configPath = path.join(process.cwd(), Constant.configFileName);
    if (!existsSync(configPath)) {
      this._default = <AppConfig>{};
    } else {
      const str = readFileSync(configPath, "utf-8");
      this._default = JSON.parse(str) as AppConfig;
    }
    return this._default;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static get tsconfig(): any | null {
    const tsconfigPath = path.join(process.cwd(), "tsconfig.json");
    if (existsSync(tsconfigPath)) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      return require(tsconfigPath);
    } else {
      return null;
    }
  }

  public static getRouterDirPath(config: AppConfig): string {
    const result = path.join(
      this.outDir,
      config?.router?.dir || Constant.defaultRouterDir
    );

    if (!existsSync(result) || !lstatSync(result).isDirectory()) {
      throw new Error("the router dir is not exist");
    }

    return result;
  }

  public static get outDir(): string {
    return this.tsconfig?.compilerOptions?.outDir || "";
  }
}
