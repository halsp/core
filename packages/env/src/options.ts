import { DotenvConfigOptions } from "dotenv";

export interface EnvOptions extends Omit<DotenvConfigOptions, "path"> {
  mode?: string;
  cwd?: string;
}
