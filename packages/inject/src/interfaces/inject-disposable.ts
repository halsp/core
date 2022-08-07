export interface InjectDisposable {
  get disposed(): boolean | undefined;
  dispose: () => Promise<void> | void;
}
