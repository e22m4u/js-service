import {Service} from './service.js';
import {InvalidArgumentError} from './errors/index.js';

/**
 * Service container.
 */
export class ServiceContainer {
  /**
   * Services map.
   *
   * @type {Map<Function, any>}
   * @private
   */
  _services = new Map();

  /**
   * Get.
   *
   * @param {Function} ctor
   * @param {any} args
   * @return {any}
   */
  get(ctor, ...args) {
    if (!ctor || typeof ctor !== 'function')
      throw new InvalidArgumentError(
        'The first argument of ServicesContainer.get must be ' +
          'a class constructor, but %v given.',
        ctor,
      );
    let service = this._services.get(ctor);
    // instantiates if no service or args given
    if (!service || args.length) {
      service =
        'prototype' in ctor && ctor.prototype instanceof Service
          ? new ctor(this, ...args)
          : new ctor(...args);
      this._services.set(ctor, service);
      // instantiates from a factory function
    } else if (typeof service === 'function') {
      service = service();
      this._services.set(ctor, service);
    }
    return service;
  }

  /**
   * Has.
   *
   * @param {Function} ctor
   * @return {boolean}
   */
  has(ctor) {
    return this._services.has(ctor);
  }

  /**
   * Add.
   *
   * @param {Function} ctor
   * @param {any} args
   * @return {this}
   */
  add(ctor, ...args) {
    if (!ctor || typeof ctor !== 'function')
      throw new InvalidArgumentError(
        'The first argument of ServicesContainer.add must be ' +
          'a class constructor, but %v given.',
        ctor,
      );
    const factory = () =>
      ctor.prototype instanceof Service
        ? new ctor(this, ...args)
        : new ctor(...args);
    this._services.set(ctor, factory);
    return this;
  }

  /**
   * Find.
   *
   * @param {Function} ctor
   * @return {any[]}
   */
  find(ctor) {
    if (!ctor || typeof ctor !== 'function')
      throw new InvalidArgumentError(
        'The first argument of ServicesContainer.find must be ' +
          'a class constructor, but %v given.',
        ctor,
      );
    const keys = Array.from(this._services.keys());
    const ctors = keys.filter(
      key => typeof key === 'function' && key.prototype instanceof ctor,
    );
    return ctors.map(c => this.get(c));
  }
}
