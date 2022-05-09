import * as shell from "shelljs";
export { shell };
export declare function runin(path: string, func: () => Promise<void> | void): Promise<void>;
