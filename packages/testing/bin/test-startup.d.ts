import { SfaHttp } from "@sfajs/http";
import request from "supertest";
export declare class TestHttp extends SfaHttp {
    constructor(root?: string);
    request(): request.SuperTest<request.Test>;
}
