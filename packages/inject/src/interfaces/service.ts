import { HttpContext } from "@ipare/core";

export interface IService {
  /**
   * Execute after request, Scoped/Transient
   */
  dispose: (ctx: HttpContext) => Promise<void> | void;
  /**
   * Execute before injecting property
   */
  onInitializing: (ctx: HttpContext) => Promise<void> | void;

  /**
   * Execute after injection
   */
  onInitialized: (ctx: HttpContext) => Promise<void> | void;
}
