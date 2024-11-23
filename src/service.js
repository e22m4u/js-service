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
    this.container =
      container instanceof ServiceContainer
        ? container
        : new ServiceContainer();
  }

  /**
   * Получить существующий или новый экземпляр.
   *
   * @param {*} ctor
   * @param {*} args
   * @return {*}
   */
  getService(ctor, ...args) {
    return this.container.get(ctor, ...args);
  }

  /**
   * Проверка существования конструктора в контейнере.
   *
   * @param {*} ctor
   * @return {boolean}
   */
  hasService(ctor) {
    return this.container.has(ctor);
  }

  /**
   * Добавить конструктор в контейнер.
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
   * Добавить конструктор и создать экземпляр.
   *
   * @param {*} ctor
   * @param {*} args
   * @return {this}
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
   * @return {this}
   */
  setService(ctor, service) {
    this.container.set(ctor, service);
    return this;
  }
}
