import * as honion from "honion";
import { Context, Request, Response } from "./context";

export abstract class Middleware<
  TReq extends Request = Request,
  TRes extends Response = Response,
  TC extends Context<TReq, TRes> = Context<TReq, TRes>
> extends honion.Middleware<TC> {}

export class ComposeMiddleware<
  TReq extends Request = Request,
  TRes extends Response = Response,
  TC extends Context<TReq, TRes> = Context<TReq, TRes>
> extends honion.ComposeMiddleware<TC> {}
