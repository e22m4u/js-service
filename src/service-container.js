import {SERVICE_CLASS_NAME} from './service.js';
import {InvalidArgumentError} from './errors/index.js';

/**
 * Service class name.
 *
 * @type {string}
 */
export const SERVICE_CONTAINER_CLASS_NAME = 'ServiceContainer';

/**
 * Service container.
 */
export class ServiceContainer {
  /**
   * Kinds.
   *
   * @type {string[]}
   */
  static kinds = [SERVICE_CONTAINER_CLASS_NAME];

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
   * Получить родительский сервис-контейнер или выбросить ошибку.
   *
   * @returns {ServiceContainer}
   */
  getParent() {
    if (!this._parent)
      throw new InvalidArgumentError('The service container has no parent.');
    return this._parent;
  }

  /**
   * Проверить наличие родительского сервис-контейнера.
   *
   * @returns {boolean}
   */
  hasParent() {
    return Boolean(this._parent);
  }

  /**
   * Получить существующий или новый экземпляр.
   *
   * @param {*} ctor
   * @param {*} args
   * @returns {*}
   */
  get(ctor, ...args) {
    if (!ctor || typeof ctor !== 'function')
      throw new InvalidArgumentError(
        'The first argument of ServicesContainer.get must be ' +
          'a class constructor, but %v given.',
        ctor,
      );
    const isCtorRegistered = this._services.has(ctor);
    let service = this._services.get(ctor);
    let inheritedCtor = undefined;
    // если экземпляр сервиса не найден,
    // то выполняется поиск его наследника
    if (!service) {
      const ctors = this._services.keys();
      const inheritedCtor = ctors.find(v => v.prototype instanceof ctor);
      if (inheritedCtor) service = this._services.get(inheritedCtor);
    }
    // если
    //   ни экземпляр сервиса (или экземпляр наследника),
    //   ни указанный конструктор,
    //   ни конструктор наследника
    // не зарегистрированы в текущем контейнере, но определен родительский
    // контейнер, где зарегистрирован конструктор запрашиваемого сервиса,
    // то поиск передается родителю
    if (
      !service &&
      !isCtorRegistered &&
      !inheritedCtor &&
      this._parent &&
      this._parent.has(ctor)
    ) {
      return this._parent.get(ctor, ...args);
    }
    // если
    //   ни экземпляр сервиса (или экземпляр наследника),
    //   ни указанный конструктор
    // не зарегистрированы, но найден конструктор наследника,
    // то для создания экземпляра будет использован найденный
    // конструктор наследника
    if (!service && !isCtorRegistered && inheritedCtor) {
      ctor = inheritedCtor;
    }
    // если экземпляр сервиса не найден или переданы
    // аргументы, то создается новый экземпляр
    if (!service || args.length) {
      service =
        Array.isArray(ctor.kinds) && ctor.kinds.includes(SERVICE_CLASS_NAME)
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
   * Получить существующий или новый экземпляр,
   * только если конструктор зарегистрирован.
   *
   * @param {*} ctor
   * @param {*} args
   * @returns {*}
   */
  getRegistered(ctor, ...args) {
    if (!this.has(ctor))
      throw new InvalidArgumentError(
        'The constructor %v is not registered.',
        ctor,
      );
    return this.get(ctor, ...args);
  }

  /**
   * Проверить существование конструктора в контейнере.
   *
   * @param {*} ctor
   * @returns {boolean}
   */
  has(ctor) {
    if (this._services.has(ctor)) return true;
    // если не удалось найти указанный конструктор,
    // то выполняется поиск его наследника
    const ctors = this._services.keys();
    const inheritedCtor = ctors.find(v => v.prototype instanceof ctor);
    if (inheritedCtor) return true;
    // если определен родительский контейнер,
    // то выполняется поиск в родителе
    if (this._parent) return this._parent.has(ctor);
    return false;
  }

  /**
   * Добавить конструктор в контейнер.
   *
   * @param {*} ctor
   * @param {*} args
   * @returns {this}
   */
  add(ctor, ...args) {
    if (!ctor || typeof ctor !== 'function')
      throw new InvalidArgumentError(
        'The first argument of ServicesContainer.add must be ' +
          'a class constructor, but %v given.',
        ctor,
      );
    const factory = () =>
      Array.isArray(ctor.kinds) && ctor.kinds.includes(SERVICE_CLASS_NAME)
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
   * @returns {this}
   */
  use(ctor, ...args) {
    if (!ctor || typeof ctor !== 'function')
      throw new InvalidArgumentError(
        'The first argument of ServicesContainer.use must be ' +
          'a class constructor, but %v given.',
        ctor,
      );
    const service =
      Array.isArray(ctor.kinds) && ctor.kinds.includes(SERVICE_CLASS_NAME)
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
   * @returns {this}
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
