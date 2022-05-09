import fs from "fs";
import path from "path";
import tsc from "typescript";
import module from "module";
import vm from "vm";

export interface SfaConfig {
  readonly customMethods?: readonly string[];
}

export function defineConfig(config: SfaConfig): () => SfaConfig;
export function defineConfig(config: () => SfaConfig): () => SfaConfig;
export function defineConfig(
  config: SfaConfig | (() => SfaConfig)
): () => SfaConfig {
  if (typeof config == "function") {
    return config;
  } else {
    return function () {
      return config;
    };
  }
}

export function loadConfig(root: string = process.cwd()): SfaConfig {
  let code: string | undefined = undefined;

  let configFile = path.resolve(root, "sfa.config.js");
  if (fs.existsSync(configFile)) {
    code = fs.readFileSync(configFile, "utf-8");
  }

  if (!code) {
    configFile = path.resolve(root, "sfa.config.ts");
    const tsconfigFile = getTsconfig(root);
    if (fs.existsSync(configFile) && !!tsconfigFile) {
      const tsCode = fs.readFileSync(configFile, "utf-8");
      const tsconfig = fs.readFileSync(tsconfigFile, "utf-8");
      const { outputText } = tsc.transpileModule(tsCode, JSON.parse(tsconfig));
      code = outputText;
    }
  }

  if (!code) {
    return {};
  }

  const module = getModuleFromString(code, "sfa.config.js");
  console.log("module", module);
  if (module.default) {
    return module.default();
  } else if (module.exports) {
    return module.exports();
  } else {
    return {};
  }
}

function getTsconfig(root: string) {
  let filePath: string | undefined = undefined;

  let tsconfigFile = path.resolve(root, "tsconfig.json");
  if (fs.existsSync(tsconfigFile)) {
    filePath = tsconfigFile;
  }

  if (!filePath) {
    tsconfigFile = path.resolve(process.cwd(), "tsconfig.json");
    if (fs.existsSync(tsconfigFile)) {
      filePath = tsconfigFile;
    }
  }

  return filePath;
}

function getModuleFromString(
  bundle: string,
  filename: string
): { default?: () => SfaConfig; exports?: () => SfaConfig } {
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
