import {isServiceContainer} from './utils/index.js';
import {ServiceContainer} from './service-container.js';

/**
 * Service class name.
 *
 * @type {string}
 */
export const SERVICE_CLASS_NAME = 'Service';

/**
 * Service.
 */
export class Service {
  /**
   * Kinds.
   *
   * @type {string[]}
   */
  static kinds = [SERVICE_CLASS_NAME];

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
    this.container = isServiceContainer(container)
      ? container
      : new ServiceContainer();
  }

  /**
   * Получить существующий или новый экземпляр.
   *
   * @param {*} ctor
   * @param {*} args
   * @returns {*}
   */
  getService(ctor, ...args) {
    return this.container.get(ctor, ...args);
  }

  /**
   * Получить существующий или новый экземпляр,
   * только если конструктор зарегистрирован.
   *
   * @param {*} ctor
   * @param {*} args
   * @returns {*}
   */
  getRegisteredService(ctor, ...args) {
    return this.container.getRegistered(ctor, ...args);
  }

  /**
   * Проверка существования конструктора в контейнере.
   *
   * @param {*} ctor
   * @returns {boolean}
   */
  hasService(ctor) {
    return this.container.has(ctor);
  }

  /**
   * Добавить конструктор в контейнер.
   *
   * @param {*} ctor
   * @param {*} args
   * @returns {this}
   */
  addService(ctor, ...args) {
    this.container.add(ctor, ...args);
    return this;
  }

  /**
   * Добавить конструктор и создать экземпляр.
   *
   * @param {*} ctor
   * @param {*} args
   * @returns {this}
   */
  useService(ctor, ...args) {
    this.container.use(ctor, ...args);
    return this;
  }

  /**
   * Добавить конструктор и связанный экземпляр.
   *
   * @param {*} ctor
   * @param {*} service
   * @returns {this}
   */
  setService(ctor, service) {
    this.container.set(ctor, service);
    return this;
  }

  /**
   * Найти сервис удовлетворяющий условию.
   *
   * @param {function(Function, ServiceContainer): boolean} predicate
   * @param {boolean} noParent
   * @returns {*}
   */
  findService(predicate, noParent = false) {
    return this.container.find(predicate, noParent);
  }
}
