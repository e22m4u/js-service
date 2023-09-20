/**
 * A callable type with "new" operator allows
 * class and constructor.
 */
export interface Constructor<T extends object = object> {
  new (...args: any[]): T;
}
