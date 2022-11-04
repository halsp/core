import {
  Action,
  HttpConnect,
  HttpCopy,
  HttpDelete,
  HttpGet,
  HttpHead,
  HttpLink,
  HttpMove,
  HttpOptions,
  HttpPatch,
  HttpPost,
  HttpTrace,
  HttpUnlink,
  HttpWrapped,
} from "../../../src";

@HttpGet
@HttpPost
@HttpHead
@HttpConnect
@HttpOptions
@HttpPatch
@HttpTrace
@HttpDelete
@HttpMove
@HttpCopy
@HttpLink
@HttpUnlink
@HttpWrapped
export default class extends Action {
  async invoke(): Promise<void> {
    this.ok("method");
  }
}
