import { Action } from "../../../src";

export default class extends Action {
  constructor() {
    super([]);

    this.docs = {
      desc: "a docs test named test",
      input: {
        headers: [
          {
            name: "test-header1",
            desc: "a test header of test docs NO.1",
            type: "string",
          },
          {
            name: "test-header2",
            desc: "a test header of test docs NO.2",
            type: "number",
          },
        ],
      },
      output: {
        codes: [
          {
            code: 200,
            desc: "success",
          },
          {
            code: 400,
            desc: "bad request",
          },
        ],
        body: [
          {
            name: "test",
            desc: "body test prop",
            type: "string",
          },
        ],
      },
    };
  }

  async invoke(): Promise<void> {
    this.ok({
      test: "test",
    });
  }
}
