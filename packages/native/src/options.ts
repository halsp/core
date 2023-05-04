import http from "http";
import https from "https";

export interface Options extends http.ServerOptions {
  https?: https.ServerOptions;
}
