import { defineModule } from "../../../src";

function Deco(target: any) {
  target.prototype.moduleTest = true;
}

export default defineModule(() => ({
  prefix: "deco",
  decorators: [Deco],
}));
