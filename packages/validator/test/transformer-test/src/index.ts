import { V } from "@halsp/validator";

export class TestDto {
  @V
  a!: string;

  @V()
  b!: string;

  @V.IsInt().IsInt().IsInt()
  c!: string;

  @V().IsInt()
  d!: string;
}
