export interface InjectDisposable {
  dispose: () => Promise<void> | void;
}
