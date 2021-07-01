export default function isPlainObj(obj: unknown): boolean {
  if (Object.prototype.toString.call(obj).toLowerCase() != "[object object]") {
    return false;
  }

  return (
    !Object.getPrototypeOf(obj) ||
    Object.getPrototypeOf(obj) == Object.prototype
  );
}
