import { V } from "@halsp/validator";
import "../../src";
import { Action } from "@halsp/router";
import { Body } from "@halsp/pipe";

@V().Description("obj dto")
class ObjDto {
  @V().Required()
  id!: number;
}

@V().Description("content1 dto")
class Content1Dto {
  @V().Required()
  id1!: number;
}

@V().Description("content2 dto")
class Content2Dto {
  @V().Required()
  id2!: number;
}

@V().Description("obj2 dto")
class Obj2Dto extends ObjDto {
  @V().Required()
  content2!: Content1Dto;
}

@V().Description("obj3 dto")
class Obj3Dto extends ObjDto {
  @V().Required()
  content3!: Content2Dto;
}

@V().Summary("multi test")
@V().Tags("test").Response(Obj2Dto)
export default class extends Action {
  @Body
  private readonly b!: Obj3Dto;

  async invoke(): Promise<void> {
    this.ok();
  }
}
