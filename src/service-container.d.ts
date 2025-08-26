import {Constructor} from './types.js';

/**
 * Service container.
 */
export declare class ServiceContainer {
  /**
   * Constructor.
   *
   * @param parent
   */
  constructor(parent?: ServiceContainer);

  /**
   * Получить родительский сервис-контейнер или выбросить ошибку.
   */
  getParent(): ServiceContainer;

  /**
   * Проверить наличие родительского сервис-контейнера.
   */
  hasParent(): boolean;

  /**
   * Получить существующий или новый экземпляр.
   *
   * @param ctor
   * @param args
   */
  get<T extends object>(
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
  getRegistered<T extends object>(
    ctor: Constructor<T>,
    ...args: any[],
  ): T;

  /**
   * Проверить существование конструктора в контейнере.
   *
   * @param ctor
   */
  has<T extends object>(
    ctor: Constructor<T>,
  ): boolean;

  /**
   * Добавить конструктор в контейнер.
   *
   * @param ctor
   * @param args
   */
  add<T extends object>(
    ctor: Constructor<T>,
    ...args: any[],
  ): this;

  /**
   * Добавить конструктор и создать экземпляр.
   *
   * @param ctor
   * @param args
   */
  use<T extends object>(
    ctor: Constructor<T>,
    ...args: any[],
  ): this;

  /**
   * Добавить конструктор и связанный экземпляр.
   *
   * @param ctor
   * @param service
   */
  set<T extends object>(
    ctor: Constructor<T>,
    service: T,
  ): this;
}
