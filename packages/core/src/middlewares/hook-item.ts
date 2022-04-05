import { MdHook } from "./utils";

export enum HookType {
  Before,
  After,
  Constructor,
}

export interface HookItem {
  hook: MdHook;
  type: HookType;
}
