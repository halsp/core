import fs from "fs";
import path from "path";
import tsc from "typescript";
import module from "module";
import vm from "vm";

export interface SfaConfigOptions {
  root?: string;
  mode?: string;
}

export interface SfaConfig {
  readonly customMethods?: readonly string[];
}

export function defineConfig(config: SfaConfig): (mode: string) => SfaConfig;
export function defineConfig(
  config: (mode: string) => SfaConfig
): (mode: string) => SfaConfig;
export function defineConfig(
  config: SfaConfig | ((mode: string) => SfaConfig)
): (mode: string) => SfaConfig {
  if (typeof config == "function") {
    return config;
  } else {
    return () => config;
  }
}

export function loadConfig(options?: SfaConfigOptions): SfaConfig {
  const opts = {
    root: options?.root ?? process.cwd(),
    mode: options?.mode ?? "production",
  };

  let code: string | undefined = undefined;

  let configFile = path.join(opts.root, "sfa.config.js");
  if (fs.existsSync(configFile)) {
    code = fs.readFileSync(configFile, "utf-8");
  }

  if (!code) {
    configFile = path.join(opts.root, "sfa.config.ts");
    const tsconfigFile = getTsconfig(opts.root);
    if (fs.existsSync(configFile) && !!tsconfigFile) {
      const tsCode = fs.readFileSync(configFile, "utf-8");
      const tsconfig = fs.readFileSync(tsconfigFile, "utf-8");

      const transpileOptions: tsc.TranspileOptions = JSON.parse(tsconfig);

      const { outputText } = tsc.transpileModule(tsCode, transpileOptions);
      code = outputText;
    }
  }

  if (!code) {
    return {};
  }

  const module = getModuleFromString(code, "sfa.config.js");
  if (module.default) {
    return module.default(opts.mode);
  } else if (module.exports) {
    return module.exports(opts.mode);
  } else {
    return {};
  }
}

function getTsconfig(root: string) {
  let filePath: string | undefined = undefined;

  let tsconfigFile = path.join(root, "tsconfig.json");
  if (fs.existsSync(tsconfigFile)) {
    filePath = tsconfigFile;
  }

  if (!filePath) {
    tsconfigFile = path.join(process.cwd(), "tsconfig.json");
    if (fs.existsSync(tsconfigFile)) {
      filePath = tsconfigFile;
    }
  }

  return filePath;
}

function getModuleFromString(
  bundle: string,
  filename: string
): {
  default?: (mode: string) => SfaConfig;
  exports?: (mode: string) => SfaConfig;
} {
  const m: any = {};
  const wrapper = module.wrap(bundle);
  const script = new vm.Script(wrapper, {
    filename,
    displayErrors: true,
  });
  const result = script.runInThisContext();
  result.call(m, m, require, m);
  return m;
}
