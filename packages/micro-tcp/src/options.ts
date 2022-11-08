export interface MicroTcpOptions {
  host?: string;
  port?: number;
  prefix?: string;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface MicroTcpClientOptions {
  host?: string;
  port?: number;
  prefix?: string;
}
