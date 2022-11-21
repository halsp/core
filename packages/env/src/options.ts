import { DotenvConfigOptions } from "dotenv";

export interface EnvOptions extends Omit<DotenvConfigOptions, "path"> {
  cwd?: string;
}
