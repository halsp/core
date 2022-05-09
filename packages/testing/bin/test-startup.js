"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestHttp = void 0;
const http_1 = require("@sfajs/http");
const supertest_1 = __importDefault(require("supertest"));
class TestHttp extends http_1.SfaHttp {
    constructor(root) {
        TestHttp["CUSTOM_CONFIG_ROOT"] = root;
        super();
    }
    request() {
        const server = this.listen();
        return (0, supertest_1.default)(server);
    }
}
exports.TestHttp = TestHttp;
