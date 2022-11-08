import { v4 as uuid } from "uuid";

export abstract class MicroClient {
  abstract connect(): Promise<void>;
  abstract dispose(): void;
  abstract send(pattern: string, data: any): Promise<any>;
  abstract emit(pattern: string, data: any): void;

  protected createPacket(
    pattern: string,
    data: any,
    containsId: true
  ): { pattern: string; data: any; id: string };
  protected createPacket(
    pattern: string,
    data: any,
    containsId: false
  ): { pattern: string; data: any };
  protected createPacket(pattern: string, data: any, containsId: boolean) {
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
