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
   * Parent container.
   *
   * @type {ServiceContainer}
   * @private
   */
  _parent;

  /**
   * Constructor.
   *
   * @param {ServiceContainer|undefined} parent
   */
  constructor(parent = undefined) {
    if (parent != null) {
      if (!(parent instanceof ServiceContainer))
        throw new InvalidArgumentError(
          'The provided parameter "parent" of ServicesContainer.constructor ' +
            'must be an instance ServiceContainer, but %v given.',
          parent,
        );
      this._parent = parent;
    }
  }

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
    // если конструктор отсутствует в текущем
    // контейнере, но имеется в родительском,
    // то запрашиваем сервис именно из него
    if (!this._services.has(ctor) && this._parent && this._parent.has(ctor)) {
      return this._parent.get(ctor);
    }
    let service = this._services.get(ctor);
    // если экземпляр сервиса не найден
    // или переданы аргументы, то создаем
    // новый экземпляр
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
    if (this._services.has(ctor)) return true;
    if (this._parent) return this._parent.has(ctor);
    return false;
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
