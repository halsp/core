import { V } from "@halsp/validator";

export class TestDto {
  @V
  a!: string;

  @V()
  b!: string;

  @V.IsInt()
  c!: string;

  @V().IsInt()
  d!: string;
}
