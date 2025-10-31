import {Service} from './service.js';
import {Debuggable} from '@e22m4u/js-debug';
import {ServiceContainer} from './service-container.js';

/**
 * Debuggable service.
 */
export class DebuggableService extends Debuggable {
  /**
   * Kinds.
   *
   * @type {string[]}
   */
  static kinds = Service.kinds;

  /**
   * Service.
   *
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
   * @type {Service['getService']}
   */
  get getService() {
    return this._service.getService;
  }

  /**
   * Получить существующий или новый экземпляр,
   * только если конструктор зарегистрирован.
   *
   * @type {Service['getRegisteredService']}
   */
  get getRegisteredService() {
    return this._service.getRegisteredService;
  }

  /**
   * Проверка существования конструктора в контейнере.
   *
   * @type {Service['hasService']}
   */
  get hasService() {
    return this._service.hasService;
  }

  /**
   * Добавить конструктор в контейнер.
   *
   * @type {Service['addService']}
   */
  get addService() {
    return this._service.addService;
  }

  /**
   * Добавить конструктор и создать экземпляр.
   *
   * @type {Service['useService']}
   */
  get useService() {
    return this._service.useService;
  }

  /**
   * Добавить конструктор и связанный экземпляр.
   *
   * @type {Service['setService']}
   */
  get setService() {
    return this._service.setService;
  }

  /**
   * Найти сервис удовлетворяющий условию.
   *
   * @type {Service['findService']}
   */
  get findService() {
    return this._service.findService;
  }

  /**
   * Constructor.
   *
   * @param {ServiceContainer|undefined} container
   * @param {import('@e22m4u/js-debug').DebuggableOptions|undefined} options
   */
  constructor(container = undefined, options = undefined) {
    super(options);
    this._service = new Service(container);
  }
}
