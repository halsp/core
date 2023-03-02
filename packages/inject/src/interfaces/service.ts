import { Context } from "@halsp/core";

export interface IService {
  /**
   * Execute after request, Scoped/Transient
   */
  dispose: (ctx: Context) => Promise<void> | void;
  /**
   * Execute before injecting property
   */
  initializing: (ctx: Context) => Promise<void> | void;

  /**
   * Execute after injecting
   */
  initialized: (ctx: Context) => Promise<void> | void;
}
