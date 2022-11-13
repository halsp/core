import { parseBuffer } from "@ipare/micro";
import * as net from "net";
import { MicroBaseClient } from "./base";

export interface MicroTcpClientOptions {
  host?: string;
  port?: number;
  prefix?: string;
  sendTimeout?: number;
}

export class MicroTcpClient extends MicroBaseClient {
  constructor(private readonly options: MicroTcpClientOptions) {
    super();
  }

  #socket?: net.Socket;
  #tasks = new Map<string, (err?: string, data?: any) => void>();

  protected get prefix() {
    return this.options.prefix ?? "";
  }

  async connect(): Promise<net.Socket> {
    this.#close();
    const socket = new net.Socket();
    this.#socket = socket;

    socket.on("close", () => {
      //
    });

    socket.on("data", (buffer: Buffer) => {
      parseBuffer(buffer, (json) => this.#handleResponse(json));
    });

    const promise = new Promise<void>((resolve) => {
      socket.on("error", (err) => {
        console.error(err);
        resolve();
      });

      socket.on("connect", () => {
        resolve();
      });
    });

    this.#socket.connect(
      this.options.port ?? 2333,
      this.options.host ?? "localhost"
    );

    await promise;

    return socket;
  }

  #handleResponse(json: any) {
    const id = json.id;
    const callback = this.#tasks.get(id);
    callback && callback(json.error, json.data ?? json.response);
  }

  #close() {
    const socket = this.#socket;
    this.#socket = undefined;
    this.#tasks.clear();

    socket?.removeAllListeners();
    socket?.end();
  }

  /**
   * for @ipare/inject
   */
  dispose() {
    this.#close();
  }

  async send<T = any>(
    pattern: string,
    data: any,
    timeout?: number
  ): Promise<{
    data?: T;
    error?: string;
  }> {
    if (!this.#socket || this.#socket.destroyed) {
      return {
        error: "The connection is not connected",
      };
    }

    pattern = this.prefix + pattern;
    const socket = this.#socket as net.Socket;
    const packet = super.createPacket(pattern, data, true);

    return new Promise((resolve) => {
      let timeoutInstance: NodeJS.Timeout | undefined;
      const sendTimeout = timeout ?? this.options.sendTimeout ?? 10000;
      if (sendTimeout != 0) {
        timeoutInstance = setTimeout(() => {
          this.#tasks.delete(packet.id);
          resolve({
            error: "Send timeout",
          });
        }, sendTimeout);
      }

      this.#tasks.set(packet.id, (error?: string, data?: any) => {
        if (timeoutInstance) {
          clearTimeout(timeoutInstance);
          timeoutInstance = undefined;
        }
        this.#tasks.delete(packet.id);

        resolve({
          data,
          error,
        });
      });
      this.#sendPacket(socket, packet);
    });
  }

  emit(pattern: string, data: any): void {
    if (!this.#socket || this.#socket.destroyed) {
      throw new Error("The connection is not connected");
    }

    pattern = this.prefix + pattern;
    const socket = this.#socket as net.Socket;
    const packet = super.createPacket(pattern, data, false);
    this.#sendPacket(socket, packet);
  }

  #sendPacket(socket: net.Socket, packet: any) {
    const str = JSON.stringify(packet);
    socket.write(`${str.length}#${str}`);
  }
}
