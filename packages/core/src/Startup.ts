import Middleware from "./Middleware";
import Response from "./Response";
import HttpContext from "./HttpContext";
import SimpleMiddleware from "./Middleware/SimpleMiddleware";
import ResponseError from "./Response/ResponseError";
import Request from "./Request";
import StatusCode from "./Response/StatusCode";

export default class Startup {
  #ctx: HttpContext;
  public get ctx(): HttpContext {
    return this.#ctx;
  }

  constructor(req: Request) {
    this.#ctx = new HttpContext(req, new Response(StatusCode.notFound));
  }

  use(
    mdf:
      | (() => Middleware)
      | ((ctx: HttpContext, next: () => Promise<void>) => Promise<void>)
  ): Startup {
    if (!mdf) throw new Error();

    let mdFunc;
    if (mdf.length) {
      mdFunc = () => {
        return new SimpleMiddleware(
          mdf as (ctx: HttpContext, next: () => Promise<void>) => Promise<void>
        );
      };
    } else {
      mdFunc = mdf as () => Middleware;
    }

    this.ctx.mds.push({
      mdf: mdFunc,
    });

    return this;
  }

  async invoke(): Promise<Response> {
    try {
      const { mdf, md } = this.ctx.mds[0];
      let mdw;
      if (md) {
        mdw = md;
      } else {
        mdw = mdf();
      }
      mdw.init(this.ctx, 0);
      await mdw.invoke();
    } catch (err) {
      if (err instanceof ResponseError) {
        this.#handleError(err);
      } else {
        throw err;
      }
    }

    return this.ctx.res;
  }

  #handleError = function (this: Startup, err: ResponseError): void {
    if (err.status) {
      this.ctx.res.status = err.status;
    }
    if (err.body) {
      this.ctx.res.body = err.body;
    }
    Object.keys(err.headers).forEach((key) => {
      this.ctx.res.headers[key] = err.headers[key];
    });
  };
}
