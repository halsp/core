import {
  Action,
  HttpConnect,
  HttpDelete,
  HttpGet,
  HttpHead,
  HttpOptions,
  HttpPatch,
  HttpPost,
  HttpTrace,
} from "../../../src";

@HttpGet
@HttpPost
@HttpHead
@HttpConnect
@HttpOptions
@HttpPatch
@HttpTrace
@HttpDelete
export default class extends Action {
  async invoke(): Promise<void> {
    this.ok("method");
  }
}
