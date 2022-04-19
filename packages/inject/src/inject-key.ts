export interface InjectKey {
  readonly key: string;
  readonly property: string | symbol;
  readonly parameterIndex?: number;
}

export type KeyTargetType =
  | object
  | number
  | bigint
  | string
  | boolean
  | symbol;
