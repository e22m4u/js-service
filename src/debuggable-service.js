import {Service} from './service.js';
import {Debuggable} from '@e22m4u/js-debug';
import {InvalidArgumentError} from '@e22m4u/js-format';
import {ServiceContainer} from './service-container.js';
import {isServiceContainer} from './utils/is-service-container.js';

/**
 * Debuggable service.
 */
export class DebuggableService extends Debuggable {
  /**
   * Kinds.
   *
   * @type {string[]}
   */
  static kinds = [...Service.kinds];

  /**
   * Service.
   *
   * @protected
   * @type {Service}
   */
  _service;

  /**
   * Container.
   *
   * @type {ServiceContainer}
   */
  get container() {
    return this._service.container;
  }

  /**
   * Получить существующий или новый экземпляр.
   *
   * @param {*} ctor
   * @param {*} args
   * @returns {*}
   */
  getService(ctor, ...args) {
    return this._service.getService(ctor, ...args);
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
    return this._service.getRegisteredService(ctor, ...args);
  }

  /**
   * Проверка существования конструктора в контейнере.
   *
   * @param {*} ctor
   * @returns {boolean}
   */
  hasService(ctor) {
    return this._service.hasService(ctor);
  }

  /**
   * Добавить конструктор в контейнер.
   *
   * @param {*} ctor
   * @param {*} args
   * @returns {this}
   */
  addService(ctor, ...args) {
    this._service.addService(ctor, ...args);
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
    this._service.useService(ctor, ...args);
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
    this._service.setService(ctor, service);
    return this;
  }

  /**
   * Найти сервис удовлетворяющий условию.
   *
   * @param {import('./service-container.js').FindServicePredicate} predicate
   * @param {boolean} noParent
   * @returns {*}
   */
  findService(predicate, noParent = false) {
    return this._service.findService(predicate, noParent);
  }

  /**
   * Constructor.
   *
   * @param {ServiceContainer|import('@e22m4u/js-debug').DebuggableOptions} [containerOrOptions]
   * @param {import('@e22m4u/js-debug').DebuggableOptions} [options]
   */
  constructor(containerOrOptions, options) {
    let container;
    // если первый аргумент является контейнером,
    // то второй аргумент остается без изменений
    if (isServiceContainer(containerOrOptions)) {
      container = containerOrOptions;
    }
    // если первый аргумент не является контейнером,
    // то он может содержать объект настроек
    else if (containerOrOptions !== undefined) {
      // если первый аргумент определен, но не является
      // объектом, то выбрасывается ошибка
      if (
        !containerOrOptions ||
        typeof containerOrOptions !== 'object' ||
        Array.isArray(containerOrOptions)
      ) {
        throw new InvalidArgumentError(
          'First parameter must be an Object or an instance ' +
            'of ServiceContainer, but %v was given.',
          containerOrOptions,
        );
      }
      // если второй аргумент не определен, то первый
      // аргумент воспринимается как объект настроек
      if (options === undefined) {
        options = containerOrOptions;
        container = new ServiceContainer();
      }
      // если оба аргумента определены, когда первый
      // не является контейнером, то выбрасывается ошибка
      else {
        throw new InvalidArgumentError('Constructor signature mismatch.');
      }
    }
    // если второй аргумент определен, когда первый оказался
    // undefined, то выполняется проверка типа аргумента
    else if (options !== undefined) {
      if (!options || typeof options !== 'object' || Array.isArray(options)) {
        throw new InvalidArgumentError(
          'Second parameter must be an Object, but %v was given.',
          options,
        );
      }
    }
    super(options);
    // если пользовательский контейнер не определен, то важно
    // явно передать контейнер во внутренний сервис, чтобы тот
    // не регистрировал собственный экземпляр в контейнере,
    // который создается автоматически
    if (container === undefined) {
      container = new ServiceContainer();
      this._service = new Service(container);
      // так как данный класс использует композицию, контейнер
      // внутреннего сервиса ничего не знает о данном экземпляре,
      // поэтому требуется выполнить его регистрацию, но только
      // в том случае, если данный класс является наследником
      if (this.constructor !== DebuggableService) {
        // проблемой дублирования пакетов (когда npm устанавливает
        // несколько версий одной библиотеки в разные папки node_modules)
        // можно пренебречь, так как в данном конкретном случае ссылка
        // на класс DebuggableService замкнута внутри лексической области
        // одного файла и проверяется относительно самой себя,
        // а не пришедшего извне объекта
        container.set(this.constructor, this);
      }
    } else {
      this._service = new Service(container);
    }
  }
}
