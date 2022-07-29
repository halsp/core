import { DotenvConfigOptions } from "dotenv";

export interface ModeConfigOptions {
  mode: string;
  cwd?: string;
  debug?: boolean;
  encoding?: string;
  override?: boolean;
}

export { DotenvConfigOptions };

export type EnvOptions = ModeConfigOptions | DotenvConfigOptions;

export function isModelOptions(
  options?: ModeConfigOptions | DotenvConfigOptions
): options is ModeConfigOptions {
  return !!(options as ModeConfigOptions)?.mode;
}
