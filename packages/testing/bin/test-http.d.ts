import { SfaHttp } from "@sfajs/http";
import supertest from "supertest";
export declare class TestHttp extends SfaHttp {
    #private;
    constructor(root?: string);
    run(func: (request: supertest.SuperTest<supertest.Test>) => supertest.Test | Promise<supertest.Test>, port?: number, hostName?: string): Promise<supertest.Response>;
}
