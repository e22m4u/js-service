import {Service} from './service.js';
import {InvalidArgumentError} from './errors/index.js';

/**
 * Service container.
 */
export class ServiceContainer {
  /**
   * Services map.
   *
   * @type {Map<any, any>}
   * @private
   */
  _services = new Map();

  /**
   * Получить существующий или новый экземпляр.
   *
   * @param {*} ctor
   * @param {*} args
   * @return {*}
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
   * Проверка существования конструктора в контейнере.
   *
   * @param {*} ctor
   * @return {boolean}
   */
  has(ctor) {
    return this._services.has(ctor);
  }

  /**
   * Добавить конструктор в контейнер.
   *
   * @param {*} ctor
   * @param {*} args
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
   * Добавить конструктор и создать экземпляр.
   *
   * @param {*} ctor
   * @param {*} args
   * @return {this}
   */
  use(ctor, ...args) {
    if (!ctor || typeof ctor !== 'function')
      throw new InvalidArgumentError(
        'The first argument of ServicesContainer.use must be ' +
          'a class constructor, but %v given.',
        ctor,
      );
    const service =
      ctor.prototype instanceof Service
        ? new ctor(this, ...args)
        : new ctor(...args);
    this._services.set(ctor, service);
    return this;
  }

  /**
   * Добавить конструктор и связанный экземпляр.
   *
   * @param {*} ctor
   * @param {*} service
   * @return {this}
   */
  set(ctor, service) {
    if (!ctor || typeof ctor !== 'function')
      throw new InvalidArgumentError(
        'The first argument of ServicesContainer.set must be ' +
          'a class constructor, but %v given.',
        ctor,
      );
    if (!service || typeof service !== 'object' || Array.isArray(service))
      throw new InvalidArgumentError(
        'The second argument of ServicesContainer.set must be ' +
          'an Object, but %v given.',
        service,
      );
    this._services.set(ctor, service);
    return this;
  }
}
