export enum ReqDecoType {
  Body,
  Query,
  Param,
  Header,
  Ctx,
}

export interface ReqDecoItem {
  propertyKey: string;
  type: ReqDecoType;
  property?: string;
}
