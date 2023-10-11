import { JwtSecretRequestType } from "../src";
import { OPTIONS } from "../src/constant";
import { runJwtServiceTest } from "./utils";

const publicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAsW9qavZzbbcyTbVVQBX7
eRUQ4MsPLlx3BkVravdhxO2ofBIBqtzXI7uS/FUqSmf7Il9ktkXr872LaINyn8Av
Q4LZtNsGG8HX+iUGWQcP4tPg/DK74k2XDYwmbUxGjIU5dLe44zw8T9petOBhjDoG
Wtwjc+lQurH/NmIhiMSa6whXjhmabW/+FA/DaGp150h/qxSsSQMcRl84lLIZ1kbv
ghJPBy4rJGZhctwkDKYtlZf5KJClwDFTISoi1mNpW9U6lm1cVXyRHHqD/6w7Qox4
hjy8owflaQ0WLYOLX0y98gCV5pp2fUzxVAFeoLIj06zeGkezdg9Q9M6iUMxlmV2m
7wIDAQAB
-----END PUBLIC KEY-----`;
const privateKey = `-----BEGIN RSA PRIVATE KEY-----
MIIEogIBAAKCAQEAsW9qavZzbbcyTbVVQBX7eRUQ4MsPLlx3BkVravdhxO2ofBIB
qtzXI7uS/FUqSmf7Il9ktkXr872LaINyn8AvQ4LZtNsGG8HX+iUGWQcP4tPg/DK7
4k2XDYwmbUxGjIU5dLe44zw8T9petOBhjDoGWtwjc+lQurH/NmIhiMSa6whXjhma
bW/+FA/DaGp150h/qxSsSQMcRl84lLIZ1kbvghJPBy4rJGZhctwkDKYtlZf5KJCl
wDFTISoi1mNpW9U6lm1cVXyRHHqD/6w7Qox4hjy8owflaQ0WLYOLX0y98gCV5pp2
fUzxVAFeoLIj06zeGkezdg9Q9M6iUMxlmV2m7wIDAQABAoIBABQjl7oNP/u3e9ur
FcKA3DqZhAFnutDhyNaq4W7SJkQyT1nJt2u7xiV1oFDIn9SzKaN0nVs843OWU3Do
3oU4TIUGoIwxAef7n/Zx5l8LeKefsd0eKwocEWWFv0TPkABaDLPtOGx+RUAxAmfY
QeonGdqNOu7oj/OoyVVUXQcHfafoaW3Ze9qH/zgagbqsWOxX+eRFVIC6F15kaUBm
QP1hf8rRxiMTB2v1ld0XaX31VQuK6PE5xhEks8GEybCfCX7Oj6bG8edxEtGG+uHG
OPu2wm0gUJIjJo4/5/cTxKoncgtU4K9D+UPTCuxpmQUvLjnmH9tHzJwEwhLqBmw/
kbk3f8UCgYEA5+uDqgAWKpXzkfENFE09+bjLi0OMy3cZ9A84nL6l9V7Nsj+xYhh6
Gle8u6Dt+fj0DzheI5LS6l9Q1fW2D3Tjp3DKeCXpacOAyu1sotdzWHxWPPsC83a2
xLsJ3THVPQTQK3cJf6cMaWgI9fUjE5b50q+5J2v+P8W1PhrZd5jySlMCgYEAw9uv
H9WDwLuRiezbVryvDkrUR2AgbarrCtjzA4PHsEnLP10NOj1cUtpPCT/CfeKKMFA5
93N2x2RxjCdb3k3YG9V6q6mG7V8BUI9LLz8kIh/vbDaT/JWfftMbKr9Q6r6peMyj
POEmtfQ/Hi9qQlOBPIw1uWwn0AeI/UyCM9r3tXUCgYBCwyeJ3rCC3dvaHVw4hevb
YXkmw/FZ+RU9jswrQy6fLgVk1LUJmiY8QxmPocof9ay8XOusre2NjpbEoREh7fJD
F1MRt0g0LBV9VU+6qO8Jf/GLaG73CyueAoHabSgHgsUyXfgcCUinZ019EG5ii0mr
fu58DLiKPy3njO8hYKQPBQKBgE0OSUAFCOjy4reY8FKXuWeuGQZb02ZSMFb8M9/W
IOJCpiwvt9yJ96DBMwc4hpRwZF3NsoCgdMLNyb6SXZqAld2dh72x3NvW3PWM6s+T
z+t9FP1GG8LsOuvysmWHD5bLnHFiUXbKPiioB40gqnWd1OK1Zw2kd6Vo0YSWbUNp
irthAoGAB1tOk9UMNfZyqSx+ff3mkNDy+zGI35WMzC9XtuZG7xJwJlpiv0Raf3uh
iQ/HwJFe8slNO4c5ktaQfpPi/r8ypyANyDM6cceWm7nBfozI9gRFu9/nzj+5gm/3
C+FNbeux5oFpmYzhpvNFn59A9zjFYWSGTlbDdgJIVxOxWqNxIww=
-----END RSA PRIVATE KEY-----`;

test(`key`, async () => {
  await runJwtServiceTest(async (jwtService, ctx) => {
    const token = await jwtService.sign(
      {},
      { privateKey: privateKey, algorithm: "RS256" },
    );
    ctx[OPTIONS].tokenProvider = () => token;
    const jwt = await jwtService.verify({
      publicKey: publicKey,
    });
    expect(Object.keys(jwt)).toEqual(["iat"]);
  });
});

test(`options key`, async () => {
  await runJwtServiceTest(
    async (jwtService, ctx) => {
      const token = await jwtService.sign({}, { algorithm: "RS256" });
      ctx[OPTIONS].tokenProvider = () => token;
      const jwt = await jwtService.verify();
      expect(Object.keys(jwt)).toEqual(["iat"]);
    },
    {
      privateKey: privateKey,
      publicKey: publicKey,
    },
  );
});

test(`secretOrKeyProvider`, async () => {
  await runJwtServiceTest(
    async (jwtService, ctx) => {
      const token = await jwtService.sign({}, { algorithm: "RS256" });
      ctx[OPTIONS].tokenProvider = () => token;
      const jwt = await jwtService.verify();
      expect(Object.keys(jwt)).toEqual(["iat"]);
    },
    {
      secretOrKeyProvider: (type: JwtSecretRequestType) =>
        type == JwtSecretRequestType.SIGN ? privateKey : publicKey,
    },
  );
});
