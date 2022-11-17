import * as net from "net";
import { IMicroClient } from "@ipare/micro-client";
import {
  ClientPacket,
  parseTcpBuffer,
  ServerPacket,
} from "@ipare/micro-common";
import { MicroTcpClientOptions } from "./options";

export class MicroTcpClient extends IMicroClient {
  constructor(private readonly options: MicroTcpClientOptions = {}) {
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
      parseTcpBuffer(buffer, (json: any) => this.#handleResponse(json));
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
  ): Promise<ClientPacket<T>> {
    if (!this.#socket || this.#socket.destroyed) {
      return {
        error: "The connection is not connected",
      };
    }

    pattern = this.prefix + pattern;
    const socket = this.#socket as net.Socket;
    const serverPacket = super.createServerPacket(pattern, data, true);

    return new Promise((resolve) => {
      let timeoutInstance: NodeJS.Timeout | undefined;
      const sendTimeout = timeout ?? this.options.sendTimeout ?? 10000;
      if (sendTimeout != 0) {
        timeoutInstance = setTimeout(() => {
          this.#tasks.delete(serverPacket.id);
          resolve({
            error: "Send timeout",
          });
        }, sendTimeout);
      }

      this.#tasks.set(serverPacket.id, (error?: string, data?: any) => {
        if (timeoutInstance) {
          clearTimeout(timeoutInstance);
          timeoutInstance = undefined;
        }
        this.#tasks.delete(serverPacket.id);

        resolve({
          data,
          error,
        });
      });
      this.#sendPacket(socket, serverPacket);
    });
  }

  emit(pattern: string, data: any): void {
    if (!this.#socket || this.#socket.destroyed) {
      throw new Error("The connection is not connected");
    }

    pattern = this.prefix + pattern;
    const socket = this.#socket as net.Socket;
    const serverPacket = super.createServerPacket(pattern, data, false);
    this.#sendPacket(socket, serverPacket);
  }

  #sendPacket(socket: net.Socket, serverPacket: ServerPacket) {
    const str = JSON.stringify(serverPacket);
    socket.write(`${str.length}#${str}`);
  }
}
