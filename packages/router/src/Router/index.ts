import { Startup } from "sfa";
import Authority from "../Authority";
import MapPraser from "./MapPraser";

export default class Router {
  #mapPraser!: MapPraser;

  constructor(
    private readonly startup: Startup,
    private readonly authFunc?: () => Authority
  ) {}

  use(): void {
    this.startup.use(async (ctx, next) => {
      this.#mapPraser = new MapPraser(ctx);
      this.setQuery();
      await next();
    });
    if (this.authFunc) {
      const authFunc = this.authFunc;
      this.startup.use(() => {
        const auth = authFunc();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (auth.roles as any) = this.#mapPraser.mapItem.roles;
        return auth;
      });
    }
    this.startup.use(() => this.#mapPraser.action);
  }

  private setQuery(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.startup.ctx.req as any).query = {};
    if (!this.#mapPraser.mapItem.path.includes("^")) return;

    const reqPath = this.startup.ctx.req.path;
    const mapPathStrs = this.#mapPraser.mapItem.path.split("/");
    const reqPathStrs = reqPath.split("/");
    for (let i = 0; i < Math.min(mapPathStrs.length, reqPathStrs.length); i++) {
      const mapPathStr = mapPathStrs[i];
      if (!mapPathStr.startsWith("^")) continue;
      const reqPathStr = reqPathStrs[i];

      const key = mapPathStr.substr(1, mapPathStr.length - 1);
      const value = decodeURIComponent(reqPathStr);
      this.startup.ctx.req.query[key] = value;
    }
  }
}
