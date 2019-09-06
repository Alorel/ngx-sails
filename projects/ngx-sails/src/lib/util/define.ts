/**
 * @internal
 * @private
 */
export function defineEnumerable(obj: any, k: PropertyKey, value: any): void {
  Object.defineProperty(obj, k, {
    configurable: false,
    enumerable: true,
    value,
    writable: false
  });
}

/**
 * @internal
 * @private
 */
export function defineHidden(obj: any, k: PropertyKey, value: any): void {
  Object.defineProperty(obj, k, {
    configurable: false,
    enumerable: false,
    value,
    writable: false
  });
}
