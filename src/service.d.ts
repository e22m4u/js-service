import {Constructor} from './types';
import {ServiceContainer} from './service-container';

/**
 * Service.
 */
export declare class Service {
  /**
   * Container.
   */
  container: ServiceContainer;

  /**
   * Constructor.
   *
   * @param container
   */
  constructor(container?: ServiceContainer);

  /**
   * Get service.
   *
   * @param ctor
   * @param args
   */
  getService<T extends object>(
    ctor: Constructor<T>,
    ...args: any[],
  ): T;

  /**
   * Has service.
   *
   * @param ctor
   */
  hasService<T extends object>(
    ctor: Constructor<T>,
  ): boolean;

  /**
   * Add service.
   *
   * @param ctor
   * @param args
   */
  addService<T extends object>(
    ctor: Constructor<T>,
    ...args: any[],
  ): this;

  /**
   * Use service.
   *
   * @param ctor
   * @param args
   */
  useService<T extends object>(
    ctor: Constructor<T>,
    ...args: any[],
  ): this;
}
