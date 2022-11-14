import { ILogger } from "@ipare/core";
import { ServerPacket } from "@ipare/micro-common";
import { v4 as uuid } from "uuid";

export abstract class IMicroClient {
  abstract connect(): Promise<any>;
  abstract dispose(): void;
  abstract send(pattern: string, data: any): Promise<any>;
  abstract emit(pattern: string, data: any): void;

  public logger!: ILogger;

  protected createServerPacket<T = any>(
    pattern: string,
    data: any,
    containsId: true
  ): ServerPacket<T> & { id: string };
  protected createServerPacket<T = any>(
    pattern: string,
    data: any,
    containsId: false
  ): ServerPacket<T>;
  protected createServerPacket(
    pattern: string,
    data: any,
    containsId: boolean
  ) {
    const result: any = {
      pattern,
      data,
    };
    if (containsId) {
      result.id = uuid();
    }
    return result;
  }
}
