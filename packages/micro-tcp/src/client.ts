import { MicroClient, PatternType, parseBuffer } from "@ipare/micro";
import * as net from "net";
import { MicroTcpClientOptions } from "./options";

export class MicroTcpClient extends MicroClient {
  constructor(private readonly options: MicroTcpClientOptions) {
    super();
  }

  #socket?: net.Socket;
  #tasks = new Map<string, (err?: string, data?: any) => void>();

  async connect(): Promise<void> {
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
  }

  #handleResponse(json: any) {
    const id = json.id;
    const callback = this.#tasks.get(id);
    if (callback) {
      callback(json.error, json.data ?? json.response);
      this.#tasks.delete(id);
    }
  }

  #close() {
    const socket = this.#socket;
    this.#socket = undefined;
    this.#tasks.clear();
    socket?.end();
  }

  /**
   * for @ipare/inject
   */
  dispose(): void {
    this.#close();
  }

  send<T = any>(
    pattern: PatternType,
    data: any
  ): Promise<{
    data?: T;
    error?: string;
  }> {
    this.#checkSocket();

    const socket = this.#socket as net.Socket;
    const packet = super.createPacket(pattern, data, true);

    return new Promise((resolve) => {
      this.#tasks.set(packet.id, (error?: string, data?: any) => {
        resolve({
          data,
          error,
        });
      });
      this.#sendPacket(socket, packet);
    });
  }

  emit(pattern: PatternType, data: any): void {
    this.#checkSocket();

    const socket = this.#socket as net.Socket;
    const packet = super.createPacket(pattern, data, false);
    this.#sendPacket(socket, packet);
  }

  #sendPacket(socket: net.Socket, packet: any) {
    const str = JSON.stringify(packet);
    socket.write(`${str.length}#${str}`);
  }

  #checkSocket() {
    if (!this.#socket || this.#socket.destroyed) throw new Error();
  }
}
