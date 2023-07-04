import { defineModule } from "../../../src";

function Deco(target: any) {
  target.prototype.moduleTest = true;
}

export default defineModule(() => ({
  decorators: [Deco],
  deepDir: "actions",
}));
