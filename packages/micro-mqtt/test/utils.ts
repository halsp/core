import { Context } from "@ipare/core";
import {
  MicroMqttClient,
  MicroMqttClientOptions,
  MicroMqttOptions,
  MicroMqttStartup,
} from "../src";
import { mockConnection, mockConnectionFrom } from "../src/mock";
import { v4 as uuid } from "uuid";

export async function runSendTest(
  data: any,
  middleware?: (ctx: Context) => void | Promise<void>,
  startupOptions?: MicroMqttOptions,
  clientOptions?: MicroMqttClientOptions
) {
  const pattern = uuid().replace(/\-/g, "");

  let invoke = false;
  let setPattern = false;
  const startup = new MicroMqttStartup(startupOptions)
    .use(async (ctx, next) => {
      invoke = true;
      await next();
    })
    .use(middleware ?? (() => undefined))
    .pattern(pattern, () => {
      setPattern = true;
    });
  mockConnection.bind(startup)();
  await startup.listen();

  await new Promise<void>((resolve) => {
    setTimeout(async () => {
      resolve();
    }, 500);
  });

  const client = new MicroMqttClient(clientOptions ?? startupOptions);
  mockConnectionFrom.bind(client)(startup);
  await client.connect();

  const result = await client.send(pattern, data);

  await new Promise<void>((resolve) => {
    setTimeout(async () => {
      resolve();
    }, 500);
  });

  await startup.close();
  await client.dispose();

  expect(invoke).toBeTruthy();
  expect(setPattern).toBeTruthy();

  return result;
}

export async function runEmitTest(
  data: any,
  middleware?: (ctx: Context) => void | Promise<void>,
  startupOptions?: MicroMqttOptions,
  clientOptions?: MicroMqttClientOptions
) {
  const pattern = uuid().replace(/\-/g, "");

  let invoke = false;
  let setPattern = false;
  const startup = new MicroMqttStartup(startupOptions)
    .use(async (ctx, next) => {
      invoke = true;
      await next();
    })
    .use(middleware ?? (() => undefined))
    .pattern(pattern, () => {
      setPattern = true;
    });
  mockConnection.bind(startup)();
  await startup.listen();

  await new Promise<void>((resolve) => {
    setTimeout(async () => {
      resolve();
    }, 500);
  });

  const client = new MicroMqttClient(clientOptions ?? startupOptions);
  mockConnectionFrom.bind(client)(startup);
  await client.connect();

  client.emit(pattern, data);

  await new Promise<void>((resolve) => {
    setTimeout(async () => {
      resolve();
    }, 500);
  });

  await startup.close();
  await client.dispose();

  expect(invoke).toBeTruthy();
  expect(setPattern).toBeTruthy();
}