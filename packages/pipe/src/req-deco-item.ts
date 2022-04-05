export enum ReqDecoType {
  Body,
  Query,
  Param,
  Header,
}

export interface ReqDecoItem {
  propertyKey: string;
  type: ReqDecoType;
  property?: string;
}
