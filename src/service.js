import {ServiceContainer} from './service-container.js';

/**
 * Service.
 */
export class Service {
  /**
   * Container.
   *
   * @type {ServiceContainer}
   */
  container;

  /**
   * Constructor.
   *
   * @param container
   */
  constructor(container) {
    this.container =
      container instanceof ServiceContainer
        ? container
        : new ServiceContainer();
  }

  /**
   * Get service.
   *
   * @param {any} ctor
   * @param {any} args
   * @return {any}
   */
  getService(ctor, ...args) {
    return this.container.get(ctor, ...args);
  }

  /**
   * Has service.
   *
   * @param {any} ctor
   * @return {boolean}
   */
  hasService(ctor) {
    return this.container.has(ctor);
  }

  /**
   * Add service.
   *
   * @param {any} ctor
   * @param {any} args
   * @return {this}
   */
  addService(ctor, ...args) {
    this.container.add(ctor, ...args);
    return this;
  }

  /**
   * Find services.
   *
   * @param {any} ctor
   * @return {any[]}
   */
  findServices(ctor) {
    return this.container.find(ctor);
  }
}
