/** Basic object type */
export interface AnyObject<T = any> {
  [k: string]: T;
}
