import {
  MicroRedisClient,
  MicroRedisClientOptions,
  MicroRedisOptions,
  MicroRedisStartup,
} from "../src";
import { mockConnection, mockConnectionFrom } from "../src/mock";
import { v4 as uuid } from "uuid";
import { Context } from "@ipare/core";

export const localOptions: MicroRedisOptions = {
  host: "127.0.0.1",
  port: 6379,
  password: "H",
};

export const localTest = !!process.env.LOCAL_TEST;

export async function runSendTest(
  data: any,
  middleware?: (ctx: Context) => void | Promise<void>,
  startupOptions?: MicroRedisOptions,
  clientOptions?: MicroRedisClientOptions,
  useLocalTest = false
) {
  const isLocalTest = localTest && useLocalTest;
  if (isLocalTest) {
    startupOptions = Object.assign({}, startupOptions, localOptions);
    clientOptions = Object.assign(
      {},
      clientOptions ?? startupOptions,
      localOptions
    );
  }

  const pattern = uuid();

  let invoke = false;
  let setPattern = false;
  const startup = new MicroRedisStartup(startupOptions)
    .use(async (ctx, next) => {
      invoke = true;
      await next();
    })
    .use(middleware ?? (() => undefined))
    .pattern(pattern, () => {
      setPattern = true;
    });
  if (!isLocalTest) {
    mockConnection.bind(startup)();
  }
  await startup.listen();

  await new Promise<void>((resolve) => {
    setTimeout(async () => {
      resolve();
    }, 500);
  });

  const client = new MicroRedisClient(clientOptions ?? startupOptions);
  if (!isLocalTest) {
    mockConnectionFrom.bind(client)(startup);
  }
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
  startupOptions?: MicroRedisOptions,
  clientOptions?: MicroRedisClientOptions,
  useLocalTest = false
) {
  const pattern = uuid();

  const isLocalTest = !!process.env.LOCAL_TEST && useLocalTest;
  if (isLocalTest) {
    startupOptions = Object.assign({}, startupOptions, localOptions);
    clientOptions = Object.assign(
      {},
      clientOptions ?? startupOptions,
      localOptions
    );
  }

  let invoke = false;
  let setPattern = false;
  const startup = new MicroRedisStartup(startupOptions)
    .use(async (ctx, next) => {
      invoke = true;
      await next();
    })
    .use(middleware ?? (() => undefined))
    .pattern(pattern, () => {
      setPattern = true;
    });
  if (!isLocalTest) {
    mockConnection.bind(startup)();
  }
  await startup.listen();

  await new Promise<void>((resolve) => {
    setTimeout(async () => {
      resolve();
    }, 500);
  });

  const client = new MicroRedisClient(clientOptions ?? startupOptions);
  if (!isLocalTest) {
    mockConnectionFrom.bind(client)(startup);
  }
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
