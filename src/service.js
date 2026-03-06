import {isServiceContainer} from './utils/index.js';
import {InvalidArgumentError} from '@e22m4u/js-format';
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
   * @protected
   * @type {ServiceContainer}
   */
  _container;

  /**
   * Container.
   *
   * @type {ServiceContainer}
   */
  get container() {
    return this._container;
  }

  /**
   * Constructor.
   *
   * @param {ServiceContainer} [container]
   */
  constructor(container = undefined) {
    if (isServiceContainer(container)) {
      this._container = container;
    } else if (container !== undefined) {
      throw new InvalidArgumentError(
        'Parameter "container" must be an instance ' +
          'of ServiceContainer, but %v was given.',
        container,
      );
    } else {
      this._container = new ServiceContainer();
      // если класс данного экземпляра наследуется от базового,
      // то при создании внутреннего контейнера, текущий экземпляр
      // будет зарегистрирован внутри своего же контейнера
      if (this.constructor !== Service) {
        // проблемой дублирования пакетов (когда npm устанавливает
        // несколько версий одной библиотеки в разные папки node_modules)
        // можно пренебречь, так как в данном конкретном случае ссылка
        // на класс Service замкнута внутри лексической области одного
        // файла и проверяется относительно самой себя, а не пришедшего
        // извне объекта
        this._container.set(this.constructor, this);
      }
    }
  }

  /**
   * Получить существующий или новый экземпляр.
   *
   * @param {*} ctor
   * @param {*} args
   * @returns {*}
   */
  getService(ctor, ...args) {
    return this._container.get(ctor, ...args);
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
    return this._container.getRegistered(ctor, ...args);
  }

  /**
   * Проверка существования конструктора в контейнере.
   *
   * @param {*} ctor
   * @returns {boolean}
   */
  hasService(ctor) {
    return this._container.has(ctor);
  }

  /**
   * Добавить конструктор в контейнер.
   *
   * @param {*} ctor
   * @param {*} args
   * @returns {this}
   */
  addService(ctor, ...args) {
    this._container.add(ctor, ...args);
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
    this._container.use(ctor, ...args);
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
    this._container.set(ctor, service);
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
    return this._container.find(predicate, noParent);
  }
}
