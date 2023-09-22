import {Constructor} from './types.js';

/**
 * Service container.
 */
export declare class ServiceContainer {
  /**
   * Get.
   *
   * @param ctor
   * @param args
   */
  get<T extends object>(
    ctor: Constructor<T>,
    ...args: any[],
  ): T;

  /**
   * Has.
   *
   * @param ctor
   */
  has<T extends object>(
    ctor: Constructor<T>,
  ): boolean;

  /**
   * Add.
   *
   * @param ctor
   * @param args
   */
  add<T extends object>(
    ctor: Constructor<T>,
    ...args: any[],
  ): this;

  /**
   * Use.
   *
   * @param ctor
   * @param args
   */
  use<T extends object>(
    ctor: Constructor<T>,
    ...args: any[],
  ): this;
}
