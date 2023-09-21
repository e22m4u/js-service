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
   * @param {ServiceContainer|undefined} container
   */
  constructor(container = undefined) {
    this.container =
      container instanceof ServiceContainer
        ? container
        : new ServiceContainer();
  }

  /**
   * Get service.
   *
   * @param {*} ctor
   * @param {*} args
   * @return {*}
   */
  getService(ctor, ...args) {
    return this.container.get(ctor, ...args);
  }

  /**
   * Has service.
   *
   * @param {*} ctor
   * @return {boolean}
   */
  hasService(ctor) {
    return this.container.has(ctor);
  }

  /**
   * Add service.
   *
   * @param {*} ctor
   * @param {*} args
   * @return {this}
   */
  addService(ctor, ...args) {
    this.container.add(ctor, ...args);
    return this;
  }

  /**
   * Use service.
   *
   * @param {*} ctor
   * @param {*} args
   * @return {this}
   */
  useService(ctor, ...args) {
    this.container.use(ctor, ...args);
    return this;
  }
}
