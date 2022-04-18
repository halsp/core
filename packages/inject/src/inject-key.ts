export interface InjectKey {
  readonly key: string;
  readonly property: string | symbol;
  readonly parameterIndex?: number;
}
