import { ReadonlyDict } from "@sfajs/core";
import { Action, Body, Header, Param, Query } from "../../../../src";

export default class extends Action {
  @Header()
  private readonly header!: ReadonlyDict;
  @Query()
  private readonly query1!: ReadonlyDict;
  @Query()
  private readonly query2!: ReadonlyDict;
  @Param()
  private readonly params!: ReadonlyDict;
  @Body()
  private readonly body!: ReadonlyDict;

  async invoke(): Promise<void> {
    this.ok({
      header: this.header,
      query1: this.query1,
      query2: this.query2,
      params: this.params,
      body: this.body,
    });
  }
}
