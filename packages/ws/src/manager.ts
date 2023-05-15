import { Context } from "@halsp/core";
import { BadRequestException } from "@halsp/http";
import * as http from "http";
import * as ws from "ws";
import { WebSocket } from "./decorator";
import { WsOptions } from "./options";

export class Manager {
  constructor(
    private readonly ctx: Context,
    private readonly options: WsOptions,
    private readonly wss: ws.Server
  ) {
    const server = ctx.startup["nativeServer"] as http.Server;
    if (server) {
      server.keepAliveTimeout = options.keepAliveTimeout ?? 1000 * 60 * 2;
    }
  }

  public async untilClosed() {
    if (!this.client) return;

    const client = this.client;
    if (
      client.readyState == client.CLOSING ||
      client.readyState == client.CLOSED
    ) {
      return;
    }

    await new Promise<void>((resolve) => {
      client.on("close", () => {
        resolve();
      });
    });
  }

  client?: WebSocket;

  public async tryAccept() {
    if (this.client) return this.client;

    const invalidMessage = this.#invalidMessage;
    if (invalidMessage) {
      return null;
    }

    this.client = await this.#accept();
    return this.client;
  }

  public async accept() {
    if (this.client) return this.client;

    const invalidMessage = this.#invalidMessage;
    if (invalidMessage) {
      throw new BadRequestException(invalidMessage);
    }

    this.client = await this.#accept();
    return this.client;
  }

  async #accept() {
    const req = this.ctx["reqStream"] as http.IncomingMessage;
    const client = await new Promise<ws.WebSocket>((resolve) => {
      this.wss.handleUpgrade(
        req,
        req.socket,
        Buffer.from("", "utf-8"),
        (client) => {
          resolve(client);
        }
      );
    });
    return client;
  }

  get #invalidMessage() {
    if (this.ctx.req.method != "GET") {
      return "Invalid HTTP method";
    }

    if (this.ctx.req.get<string>("Connection")?.toLowerCase() != "upgrade") {
      return "Invalid Connection header";
    }

    if (this.ctx.req.get<string>("Upgrade")?.toLowerCase() != "websocket") {
      return "Invalid Upgrade header";
    }

    const keyRegex = /^[+/0-9A-Za-z]{22}==$/;
    if (!keyRegex.test(this.ctx.req.get<string>("Sec-WebSocket-Key") ?? "")) {
      return "Missing or invalid Sec-WebSocket-Key header";
    }

    const version = Number(this.ctx.req.get("Sec-WebSocket-Version"));
    if (version != 8 && version != 13) {
      return "Missing or invalid Sec-WebSocket-Version header";
    }

    if (!this.#isOriginEnable) {
      return "The origin is not allowed";
    }

    return;
  }

  get #isOriginEnable() {
    if (!this.options.allowedOrigins?.length) {
      return true;
    }

    const origin = this.ctx.req.get<string>("origin");
    if (!origin) return false;

    return this.options.allowedOrigins.includes(origin);
  }
}
