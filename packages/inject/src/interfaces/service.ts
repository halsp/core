import { HttpContext } from "@ipare/core";

export interface IService {
  /**
   * Execute after request, Scoped/Transient
   */
  dispose: (ctx: HttpContext) => Promise<void> | void;
  /**
   * Execute before injecting property
   */
  initializing: (ctx: HttpContext) => Promise<void> | void;

  /**
   * Execute after injecting
   */
  initialized: (ctx: HttpContext) => Promise<void> | void;
}
