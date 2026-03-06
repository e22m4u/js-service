"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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

// src/service-container.js
var import_js_format = require("@e22m4u/js-format");
var SERVICE_CONTAINER_CLASS_NAME = "ServiceContainer";
var ServiceContainer = class _ServiceContainer {
  static {
    __name(this, "ServiceContainer");
  }
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
      if (!(parent instanceof _ServiceContainer)) {
        throw new import_js_format.InvalidArgumentError(
          'Parameter "parent" must be an instance of ServiceContainer, but %v given.',
          parent
        );
      }
      this._parent = parent;
    }
  }
  /**
   * Получить родительский сервис-контейнер или выбросить ошибку.
   *
   * @returns {ServiceContainer}
   */
  getParent() {
    if (!this._parent) {
      throw new import_js_format.InvalidArgumentError("Service container has no parent.");
    }
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
    if (!ctor || typeof ctor !== "function") {
      throw new import_js_format.InvalidArgumentError(
        'Parameter "ctor" must be a class constructor, but %v given.',
        ctor
      );
    }
    const isCtorRegistered = this._services.has(ctor);
    let service = this._services.get(ctor);
    let inheritedCtor = void 0;
    if (!service) {
      const ctors = Array.from(this._services.keys());
      inheritedCtor = ctors.find((v) => v.prototype instanceof ctor);
      if (inheritedCtor) {
        service = this._services.get(inheritedCtor);
      }
    }
    if (!service && !isCtorRegistered && !inheritedCtor && this._parent && this._parent.has(ctor)) {
      return this._parent.get(ctor, ...args);
    }
    if (!isCtorRegistered && inheritedCtor) {
      ctor = inheritedCtor;
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
   * Получить существующий или новый экземпляр,
   * только если конструктор зарегистрирован.
   *
   * @param {*} ctor
   * @param {*} args
   * @returns {*}
   */
  getRegistered(ctor, ...args) {
    if (!this.has(ctor)) {
      throw new import_js_format.InvalidArgumentError("Constructor %v is not registered.", ctor);
    }
    return this.get(ctor, ...args);
  }
  /**
   * Проверить существование конструктора в контейнере.
   *
   * @param {*} ctor
   * @returns {boolean}
   */
  has(ctor) {
    if (this._services.has(ctor)) {
      return true;
    }
    const ctors = Array.from(this._services.keys());
    const inheritedCtor = ctors.find((v) => v.prototype instanceof ctor);
    if (inheritedCtor) {
      return true;
    }
    if (this._parent) {
      return this._parent.has(ctor);
    }
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
    if (!ctor || typeof ctor !== "function") {
      throw new import_js_format.InvalidArgumentError(
        'Parameter "ctor" must be a class constructor, but %v given.',
        ctor
      );
    }
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
    if (!ctor || typeof ctor !== "function") {
      throw new import_js_format.InvalidArgumentError(
        'Parameter "ctor" must be a class constructor, but %v given.',
        ctor
      );
    }
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
    if (!ctor || typeof ctor !== "function") {
      throw new import_js_format.InvalidArgumentError(
        'Parameter "ctor" must be a class constructor, but %v given.',
        ctor
      );
    }
    if (!service || typeof service !== "object" || Array.isArray(service)) {
      throw new import_js_format.InvalidArgumentError(
        'Parameter "service" must be an Object, but %v given.',
        service
      );
    }
    this._services.set(ctor, service);
    return this;
  }
  /**
   * Найти сервис удовлетворяющий условию.
   *
   * @param {import('./service-container.js').FindServicePredicate} [predicate]
   * @param {boolean} [noParent]
   * @returns {*}
   */
  find(predicate, noParent = false) {
    if (typeof predicate !== "function") {
      throw new import_js_format.InvalidArgumentError(
        'Parameter "predicate" must be a Function, but %v given.',
        predicate
      );
    }
    if (typeof noParent !== "boolean") {
      throw new import_js_format.InvalidArgumentError(
        'Parameter "noParent" must be a Boolean, but %v given.',
        noParent
      );
    }
    const isRecursive = !noParent;
    let currentContainer = this;
    do {
      for (const ctor of currentContainer._services.keys()) {
        if (predicate(ctor, currentContainer) === true) {
          return this.get(ctor);
        }
      }
      if (isRecursive && currentContainer.hasParent()) {
        currentContainer = currentContainer.getParent();
      } else {
        currentContainer = null;
      }
    } while (currentContainer);
    return void 0;
  }
};

// src/utils/is-service-container.js
function isServiceContainer(container) {
  return Boolean(
    container && typeof container === "object" && typeof container.constructor === "function" && Array.isArray(container.constructor.kinds) && container.constructor.kinds.includes(SERVICE_CONTAINER_CLASS_NAME)
  );
}
__name(isServiceContainer, "isServiceContainer");

// src/service.js
var import_js_format2 = require("@e22m4u/js-format");
var SERVICE_CLASS_NAME = "Service";
var Service = class _Service {
  static {
    __name(this, "Service");
  }
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
  constructor(container = void 0) {
    if (isServiceContainer(container)) {
      this._container = container;
    } else if (container !== void 0) {
      throw new import_js_format2.InvalidArgumentError(
        'Parameter "container" must be an instance of ServiceContainer, but %v was given.',
        container
      );
    } else {
      this._container = new ServiceContainer();
      if (this.constructor !== _Service) {
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
   * @param {import('./service-container.js').FindServicePredicate} predicate
   * @param {boolean} noParent
   * @returns {*}
   */
  findService(predicate, noParent = false) {
    return this._container.find(predicate, noParent);
  }
};

// src/debuggable-service.js
var import_js_debug = require("@e22m4u/js-debug");
var import_js_format3 = require("@e22m4u/js-format");
var DebuggableService = class _DebuggableService extends import_js_debug.Debuggable {
  static {
    __name(this, "DebuggableService");
  }
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
    if (isServiceContainer(containerOrOptions)) {
      container = containerOrOptions;
    } else if (containerOrOptions !== void 0) {
      if (!containerOrOptions || typeof containerOrOptions !== "object" || Array.isArray(containerOrOptions)) {
        throw new import_js_format3.InvalidArgumentError(
          "First parameter must be an Object or an instance of ServiceContainer, but %v was given.",
          containerOrOptions
        );
      }
      if (options === void 0) {
        options = containerOrOptions;
        container = new ServiceContainer();
      } else {
        throw new import_js_format3.InvalidArgumentError("Constructor signature mismatch.");
      }
    } else if (options !== void 0) {
      if (!options || typeof options !== "object" || Array.isArray(options)) {
        throw new import_js_format3.InvalidArgumentError(
          "Second parameter must be an Object, but %v was given.",
          options
        );
      }
    }
    super(options);
    if (container === void 0) {
      container = new ServiceContainer();
      this._service = new Service(container);
      if (this.constructor !== _DebuggableService) {
        container.set(this.constructor, this);
      }
    } else {
      this._service = new Service(container);
    }
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DebuggableService,
  SERVICE_CLASS_NAME,
  SERVICE_CONTAINER_CLASS_NAME,
  Service,
  ServiceContainer,
  isServiceContainer
});
