export enum ReqParseType {
  Body,
  Query,
  Param,
  Header,
}

export interface ReqParseItem {
  propertyKey: string;
  type: ReqParseType;
  property?: string;
}
