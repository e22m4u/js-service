import {Service} from './service.js';
import {Constructor} from './types.js';
import {Debuggable} from '@e22m4u/js-debug';
import {ServiceContainer} from './service-container.js';

/**
 * Debuggable service.
 */
export class DebuggableService extends Debuggable implements Service {
  /**
   * Kind.
   */
  static readonly kinds: string[];

  /**
   * Container.
   */
  container: ServiceContainer;

  /**
   * Constructor.
   *
   * @param container
   */
  constructor(container?: ServiceContainer);

  /**
   * Получить существующий или новый экземпляр.
   *
   * @param ctor
   * @param args
   */
  getService<T extends object>(
    ctor: Constructor<T>,
    ...args: any[],
  ): T;
  
  /**
   * Получить существующий или новый экземпляр,
   * только если конструктор зарегистрирован.
   *
   * @param ctor
   * @param args
   */
  getRegisteredService<T extends object>(
    ctor: Constructor<T>,
    ...args: any[],
  ): T;

  /**
   * Проверка существования конструктора в контейнере.
   *
   * @param ctor
   */
  hasService<T extends object>(
    ctor: Constructor<T>,
  ): boolean;

  /**
   * Добавить конструктор в контейнер.
   *
   * @param ctor
   * @param args
   */
  addService<T extends object>(
    ctor: Constructor<T>,
    ...args: any[],
  ): this;

  /**
   * Добавить конструктор и создать экземпляр.
   *
   * @param ctor
   * @param args
   */
  useService<T extends object>(
    ctor: Constructor<T>,
    ...args: any[],
  ): this;

  /**
   * Добавить конструктор и связанный экземпляр.
   *
   * @param ctor
   * @param service
   */
  setService<T extends object>(
    ctor: Constructor<T>,
    service: T,
  ): this;
}