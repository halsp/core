import type grpc from "@grpc/grpc-js";

export abstract class StreamIterator<T> {
  protected queue: T[] = [];
  protected onData: (() => void) | undefined = undefined;
  protected isEnd = false;

  async *[Symbol.asyncIterator]() {
    while (true) {
      if (this.queue.length) {
        yield this.queue.splice(0, 1)[0];
      } else {
        if (this.isEnd) {
          return;
        } else {
          await new Promise<void>((resolve) => {
            this.onData = () => resolve();
          });
        }
      }
    }
  }
}

export class ReadIterator<T = any> extends StreamIterator<T> {
  constructor(
    stream:
      | grpc.ServerReadableStream<any, any>
      | grpc.ServerDuplexStream<any, any>
      | grpc.ClientReadableStream<any>
      | grpc.ClientDuplexStream<any, any>,
  ) {
    super();

    stream.on("data", (data) => {
      this.queue.push(data);
      this.onData && this.onData();
    });
    stream.on("end", () => {
      this.isEnd = true;
      this.onData && this.onData();
    });
  }
}

export class WriteIterator<T = any> extends StreamIterator<T> {
  public push(data: T) {
    this.queue.push(data);
    this.onData && this.onData();
  }
  public end() {
    this.isEnd = true;
    this.onData && this.onData();
  }
}
