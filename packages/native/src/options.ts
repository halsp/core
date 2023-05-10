import http from "http";
import net from "net";
import https from "https";

export interface NativeOptions extends net.ListenOptions, http.ServerOptions {
  https?: https.ServerOptions;
}
