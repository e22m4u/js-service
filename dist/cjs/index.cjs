var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// src/index.js
var index_exports = {};
__export(index_exports, {
  DebuggableService: () => DebuggableService,
  SERVICE_CLASS_NAME: () => SERVICE_CLASS_NAME,
  SERVICE_CONTAINER_CLASS_NAME: () => SERVICE_CONTAINER_CLASS_NAME,
  Service: () => Service,
  ServiceContainer: () => ServiceContainer,
  isServiceContainer: () => isServiceContainer
});
module.exports = __toCommonJS(index_exports);

// src/errors/invalid-argument-error.js
var import_js_format = require("@e22m4u/js-format");
var _InvalidArgumentError = class _InvalidArgumentError extends import_js_format.Errorf {
};
__name(_InvalidArgumentError, "InvalidArgumentError");
var InvalidArgumentError = _InvalidArgumentError;

// src/service-container.js
var SERVICE_CONTAINER_CLASS_NAME = "ServiceContainer";
var _ServiceContainer = class _ServiceContainer {
  /**
   * Services map.
   *
   * @type {Map<any, any>}
   * @private
   */
  _services = /* @__PURE__ */ new Map();
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
  constructor(parent = void 0) {
    if (parent != null) {
      if (!(parent instanceof _ServiceContainer))
        throw new InvalidArgumentError(
          'The provided parameter "parent" of ServicesContainer.constructor must be an instance ServiceContainer, but %v given.',
          parent
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
      throw new InvalidArgumentError("The service container has no parent.");
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
    if (!ctor || typeof ctor !== "function")
      throw new InvalidArgumentError(
        "The first argument of ServicesContainer.get must be a class constructor, but %v given.",
        ctor
      );
    if (!this._services.has(ctor) && this._parent && this._parent.has(ctor)) {
      return this._parent.get(ctor);
    }
    let service = this._services.get(ctor);
    if (!service) {
      const ctors = this._services.keys();
      const inheritedCtor = ctors.find((v) => v.prototype instanceof ctor);
      if (inheritedCtor) {
        service = this._services.get(inheritedCtor);
        ctor = inheritedCtor;
      }
    }
    if (!service || args.length) {
      service = Array.isArray(ctor.kinds) && ctor.kinds.includes(SERVICE_CLASS_NAME) ? new ctor(this, ...args) : new ctor(...args);
      this._services.set(ctor, service);
    } else if (typeof service === "function") {
      service = service();
      this._services.set(ctor, service);
    }
    return service;
  }
  /**
   * Проверить существование конструктора в контейнере.
   *
   * @param {*} ctor
   * @returns {boolean}
   */
  has(ctor) {
    if (this._services.has(ctor)) return true;
    if (this._parent) return this._parent.has(ctor);
    const ctors = this._services.keys();
    const inheritedCtor = ctors.find((v) => v.prototype instanceof ctor);
    if (inheritedCtor) return true;
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
    if (!ctor || typeof ctor !== "function")
      throw new InvalidArgumentError(
        "The first argument of ServicesContainer.add must be a class constructor, but %v given.",
        ctor
      );
    const factory = /* @__PURE__ */ __name(() => Array.isArray(ctor.kinds) && ctor.kinds.includes(SERVICE_CLASS_NAME) ? new ctor(this, ...args) : new ctor(...args), "factory");
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
    if (!ctor || typeof ctor !== "function")
      throw new InvalidArgumentError(
        "The first argument of ServicesContainer.use must be a class constructor, but %v given.",
        ctor
      );
    const service = Array.isArray(ctor.kinds) && ctor.kinds.includes(SERVICE_CLASS_NAME) ? new ctor(this, ...args) : new ctor(...args);
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
    if (!ctor || typeof ctor !== "function")
      throw new InvalidArgumentError(
        "The first argument of ServicesContainer.set must be a class constructor, but %v given.",
        ctor
      );
    if (!service || typeof service !== "object" || Array.isArray(service))
      throw new InvalidArgumentError(
        "The second argument of ServicesContainer.set must be an Object, but %v given.",
        service
      );
    this._services.set(ctor, service);
    return this;
  }
};
__name(_ServiceContainer, "ServiceContainer");
/**
 * Kinds.
 *
 * @type {string[]}
 */
__publicField(_ServiceContainer, "kinds", [SERVICE_CONTAINER_CLASS_NAME]);
var ServiceContainer = _ServiceContainer;

// src/utils/is-service-container.js
function isServiceContainer(container) {
  return Boolean(
    container && typeof container === "object" && typeof container.constructor === "function" && Array.isArray(container.constructor.kinds) && container.constructor.kinds.includes(SERVICE_CONTAINER_CLASS_NAME)
  );
}
__name(isServiceContainer, "isServiceContainer");

// src/service.js
var SERVICE_CLASS_NAME = "Service";
var _Service = class _Service {
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
  constructor(container = void 0) {
    this.container = isServiceContainer(container) ? container : new ServiceContainer();
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
};
__name(_Service, "Service");
/**
 * Kinds.
 *
 * @type {string[]}
 */
__publicField(_Service, "kinds", [SERVICE_CLASS_NAME]);
var Service = _Service;

// src/debuggable-service.js
var import_js_debug = require("@e22m4u/js-debug");
var _DebuggableService = class _DebuggableService extends import_js_debug.Debuggable {
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
   * Get service.
   *
   * @type {Service['getService']}
   */
  get getService() {
    return this._service.getService;
  }
  /**
   * Has service.
   *
   * @type {Service['hasService']}
   */
  get hasService() {
    return this._service.hasService;
  }
  /**
   * Add service.
   *
   * @type {Service['addService']}
   */
  get addService() {
    return this._service.addService;
  }
  /**
   * Use service.
   *
   * @type {Service['useService']}
   */
  get useService() {
    return this._service.useService;
  }
  /**
   * Set service.
   *
   * @type {Service['setService']}
   */
  get setService() {
    return this._service.setService;
  }
  /**
   * Constructor.
   *
   * @param {ServiceContainer|undefined} container
   * @param {import('@e22m4u/js-debug').DebuggableOptions|undefined} options
   */
  constructor(container = void 0, options = void 0) {
    super(options);
    this._service = new Service(container);
  }
};
__name(_DebuggableService, "DebuggableService");
/**
 * Kinds.
 *
 * @type {string[]}
 */
__publicField(_DebuggableService, "kinds", Service.kinds);
var DebuggableService = _DebuggableService;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DebuggableService,
  SERVICE_CLASS_NAME,
  SERVICE_CONTAINER_CLASS_NAME,
  Service,
  ServiceContainer,
  isServiceContainer
});
