"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _TestHttp_instances, _TestHttp_listen;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestHttp = void 0;
const http_1 = require("@sfajs/http");
const supertest_1 = __importDefault(require("supertest"));
class TestHttp extends http_1.SfaHttp {
    constructor(root) {
        TestHttp["CUSTOM_CONFIG_ROOT"] = root;
        super();
        _TestHttp_instances.add(this);
    }
    async run(func, port = 80, hostName) {
        const server = await __classPrivateFieldGet(this, _TestHttp_instances, "m", _TestHttp_listen).call(this, port, hostName);
        try {
            return await func((0, supertest_1.default)(server));
        }
        finally {
            server.close();
        }
    }
}
exports.TestHttp = TestHttp;
_TestHttp_instances = new WeakSet(), _TestHttp_listen = function _TestHttp_listen(port, hostName) {
    return new Promise((resolve, reject) => {
        const server = this.listen(port, hostName);
        server.on("listening", () => {
            console.log(`start: http://localhost:${port}`);
            resolve(server);
        });
        server.on("error", (err) => {
            if (err.code == "EADDRINUSE") {
                __classPrivateFieldGet(this, _TestHttp_instances, "m", _TestHttp_listen).call(this, port + 1).then((svr) => {
                    resolve(svr);
                });
            }
            else {
                reject(err);
            }
        });
    });
};
