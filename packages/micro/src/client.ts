import { PatternType } from "./pattern";
import { v4 as uuid } from "uuid";

export abstract class MicroClient {
  abstract connect(): Promise<void>;
  abstract dispose(): void;
  abstract send<T>(pattern: PatternType, data: any): Promise<T>;
  abstract emit(pattern: PatternType, data: any): void;

  protected createPacket(
    pattern: PatternType,
    data: any,
    containsId: true
  ): { pattern: PatternType; data: any; id: string };
  protected createPacket(
    pattern: PatternType,
    data: any,
    containsId: false
  ): { pattern: PatternType; data: any };
  protected createPacket(pattern: PatternType, data: any, containsId: boolean) {
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
