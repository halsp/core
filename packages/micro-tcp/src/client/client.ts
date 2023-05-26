import * as net from "net";
import { IMicroClient } from "@halsp/micro-client";
import {
  ClientPacket,
  parseTcpBuffer,
  ServerPacket,
} from "@halsp/micro-common";
import { MicroTcpClientOptions } from "../options";

export class MicroTcpClient extends IMicroClient {
  constructor(private readonly options: MicroTcpClientOptions = {}) {
    super();
  }

  #socket?: net.Socket;
  #tasks = new Map<string, (err?: string, data?: any) => void>();

  protected get prefix() {
    return this.options.prefix ?? "";
  }

  protected async connect(): Promise<net.Socket> {
    const socket = new net.Socket();
    this.#socket = socket;

    socket.on("close", () => {
      //
    });

    socket.on("data", (buffer: Buffer) => {
      parseTcpBuffer(buffer, (packet) =>
        this.#handleResponse(packet as ClientPacket)
      );
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

  #handleResponse(packet: ClientPacket & { response?: any }) {
    const id = packet.id as string;
    const callback = this.#tasks.get(id);
    callback && callback(packet.error, packet.data ?? packet.response);
  }

  async dispose() {
    const socket = this.#socket;
    this.#socket = undefined;
    this.#tasks.clear();

    if (socket) {
      socket.removeAllListeners();

      await new Promise<void>((resolve) => {
        socket.end(() => resolve());
      });
      socket.destroy();
    }
  }

  async send<T = any>(
    pattern: string,
    data: any,
    options: {
      timeout?: number;
    } = {}
  ): Promise<T> {
    if (!this.#socket || this.#socket.destroyed) {
      throw new Error("The connection is not connected");
    }

    pattern = this.prefix + pattern;
    const socket = this.#socket as net.Socket;
    const serverPacket = super.createServerPacket(pattern, data, true);

    return new Promise((resolve, reject) => {
      let timeoutInstance: NodeJS.Timeout | undefined;
      const sendTimeout = options.timeout ?? this.options.sendTimeout ?? 10000;
      if (sendTimeout != 0) {
        timeoutInstance = setTimeout(() => {
          this.#tasks.delete(serverPacket.id);
          reject(new Error("Send timeout"));
        }, sendTimeout);
      }

      this.#tasks.set(serverPacket.id, (error?: string, data?: any) => {
        if (timeoutInstance) {
          clearTimeout(timeoutInstance);
          timeoutInstance = undefined;
        }
        this.#tasks.delete(serverPacket.id);

        if (error) {
          reject(new Error(error));
        } else {
          resolve(data);
        }
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
