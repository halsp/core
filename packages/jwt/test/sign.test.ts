import { runJwtServiceTest } from "./utils";

test(`sign`, async () => {
  await runJwtServiceTest(
    async (jwtService) => {
      const token = await jwtService.sign(
        {},
        {
          secret: "secret",
        }
      );

      const jwt =
        jwtService.decode(token, {
          complete: true,
          json: true,
        }) ?? {};
      expect(Object.keys(await jwtService.verify(token))).toEqual(["iat"]);
      expect(Object.keys(jwt)).toEqual(["header", "payload", "signature"]);
      expect(Object.keys(jwt["payload"])).toEqual(["iat"]);
    },
    {
      secret: "secret",
    }
  );
});

test(`secretOrKeyProvider`, async () => {
  await runJwtServiceTest(
    async (jwtService) => {
      const token = await jwtService.sign(
        {},
        {
          secret: "secret",
        }
      );

      const jwt =
        jwtService.decode(token, {
          complete: true,
          json: true,
        }) ?? {};
      expect(Object.keys(await jwtService.verify(token))).toEqual(["iat"]);
      expect(Object.keys(jwt)).toEqual(["header", "payload", "signature"]);
      expect(Object.keys(jwt["payload"])).toEqual(["iat"]);
    },
    {
      secretOrKeyProvider: () => "secret",
    }
  );
});

test(`sign error`, async () => {
  await runJwtServiceTest(
    async (jwtService) => {
      let error = false;
      try {
        await jwtService.sign([1, 2]);
      } catch {
        error = true;
      }
      expect(error).toBeTruthy();
    },
    {
      secret: "secret",
    }
  );
});
