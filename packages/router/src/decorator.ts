/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

import Controller from "./Controller";

export function ActionDeco(method: string, path?: string, roles?: string[]) {
  return function (
    controller: Controller,
    actionName: string,
    desc: PropertyDescriptor
  ): void {
    desc.value.prototype["ACTION_METHOD"] = method;
    desc.value.prototype["ACTION_PATH"] = path;
    desc.value.prototype["ACTION_ROLES"] = roles;
    desc.value.prototype["ACTION_NAME"] = actionName;
  };
}

export function ControllerDeco(path?: string, roles?: string[]) {
  return function (controller: any): void {
    controller.prototype["CONTROLLER_PATH"] = path;
    controller.prototype["CONTROLLER_ROLES"] = roles;
  };
}
