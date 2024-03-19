export const isEmpty = (val: any) =>
  val == null || !(Object.keys(val) || val).length;

export function isObjectEmpty(obj: any) {
  for (const prop in obj) {
    if (Object.hasOwn(obj, prop)) {
      return false;
    }
  }

  return true;
}
